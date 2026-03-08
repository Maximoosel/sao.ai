import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { formatSize, type SweepFile } from '@/lib/mockData';
import { toast } from 'sonner';

export function useRelevanceScoring() {
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const analyzeFiles = useCallback(async (files: SweepFile[]): Promise<SweepFile[]> => {
    if (files.length === 0) return files;
    setIsAnalyzing(true);

    try {
      // Send files in batches of 20
      const batchSize = 20;
      const allAnalyses: any[] = [];

      for (let i = 0; i < files.length; i += batchSize) {
        const batch = files.slice(i, i + batchSize);
        const payload = batch.map(f => ({
          name: f.name,
          size: formatSize(f.size),
          lastOpened: f.lastOpened,
          path: f.path,
        }));

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
      }

      // Map analyses back to files
      const updated = files.map(file => {
        const analysis = allAnalyses.find(
          (a: any) => a.fileName === file.name
        );
        if (analysis) {
          return {
            ...file,
            keepPriority: analysis.keepPriority,
            relevanceTag: analysis.tag,
            relevanceReason: analysis.reason,
          };
        }
        return file;
      });

      setIsAnalyzing(false);
      return updated;
    } catch (e) {
      console.error('Analysis error:', e);
      toast.error('Failed to analyze files');
      setIsAnalyzing(false);
      return files;
    }
  }, []);

  return { isAnalyzing, analyzeFiles };
}
