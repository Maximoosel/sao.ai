import { useState, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { formatSize, type SweepFile } from '@/lib/mockData';
import { toast } from 'sonner';

export function useRelevanceScoring() {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const [analysisETA, setAnalysisETA] = useState<string | null>(null);
  const cancelledRef = useRef(false);

  const cancelAnalysis = useCallback(() => {
    cancelledRef.current = true;
  }, []);

  const analyzeFiles = useCallback(async (files: SweepFile[]): Promise<SweepFile[]> => {
    if (files.length === 0) return files;
    cancelledRef.current = false;
    setIsAnalyzing(true);
    setAnalysisProgress(0);
    setAnalysisETA(null);

    try {
      const batchSize = 40;
      const totalBatches = Math.ceil(files.length / batchSize);
      const allAnalyses: any[] = [];
      const startTime = Date.now();

      for (let i = 0; i < files.length; i += batchSize) {
        if (cancelledRef.current) {
          toast.info('Analysis cancelled');
          break;
        }
        const batchIndex = Math.floor(i / batchSize);
        const batch = files.slice(i, i + batchSize);

        // Send richer context per file
        const payload = batch.map(f => {
          const ext = f.name.includes('.') ? f.name.split('.').pop()?.toLowerCase() : '';
          const pathParts = f.path.split('/');
          const parentDir = pathParts.length > 1 ? pathParts[pathParts.length - 2] : '';
          const lastOpenedDate = new Date(f.lastOpened);
          const daysSinceOpened = Math.floor((Date.now() - lastOpenedDate.getTime()) / (1000 * 60 * 60 * 24));

          return {
            name: f.name,
            size: formatSize(f.size),
            lastOpened: f.lastOpened,
            path: f.path,
            extension: ext,
            fileType: f.type,
            parentDir,
            daysSinceOpened: isNaN(daysSinceOpened) ? undefined : daysSinceOpened,
          };
        });

        const { data, error } = await supabase.functions.invoke('analyze-files', {
          body: { files: payload },
        });

        if (error) {
          console.error('Analysis error:', error);
          toast.error('AI analysis failed. Using default scores.');
          break;
        }

        if (data?.analyses) {
          allAnalyses.push(...data.analyses);
        }

        // Update progress — two passes means each batch takes ~2x, so scale accordingly
        const completedBatches = batchIndex + 1;
        const progress = Math.round((completedBatches / totalBatches) * 100);
        setAnalysisProgress(progress);

        // Calculate ETA
        const elapsed = Date.now() - startTime;
        const msPerBatch = elapsed / completedBatches;
        const remaining = (totalBatches - completedBatches) * msPerBatch;
        if (remaining > 0) {
          const secs = Math.ceil(remaining / 1000);
          setAnalysisETA(secs >= 60 ? `${Math.floor(secs / 60)}m ${secs % 60}s` : `${secs}s`);
        } else {
          setAnalysisETA(null);
        }
      }

      // Map analyses back to files
      const updated = files.map(file => {
        const analysis = allAnalyses.find((a: any) => a.fileName === file.name);
        if (analysis) {
          return {
            ...file,
            keepPriority: analysis.keepPriority,
            relevanceTag: analysis.tag,
            relevanceReason: analysis.reason,
            confidence: analysis.confidence,
          };
        }
        return file;
      });

      setIsAnalyzing(false);
      setAnalysisProgress(100);
      setAnalysisETA(null);

      // Notify about low-confidence files
      const lowConfidence = updated.filter(f => f.confidence !== undefined && f.confidence < 60);
      if (lowConfidence.length > 0) {
        toast.info(`${lowConfidence.length} file${lowConfidence.length > 1 ? 's' : ''} flagged as uncertain — review manually`, {
          duration: 4000,
        });
      }

      return updated;
    } catch (e) {
      console.error('Analysis error:', e);
      toast.error('Failed to analyze files');
      setIsAnalyzing(false);
      setAnalysisProgress(0);
      setAnalysisETA(null);
      return files;
    }
  }, []);

  return { isAnalyzing, analysisProgress, analysisETA, analyzeFiles, cancelAnalysis };
}