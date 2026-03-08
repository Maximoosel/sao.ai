export type FileCategory = 'large' | 'old' | 'downloads' | 'duplicates' | 'screenshots';

export type RelevanceTag = 'essential' | 'useful' | 'questionable' | 'low-priority' | 'safe-to-remove';

export interface SweepFile {
  id: string;
  name: string;
  path: string;
  size: number; // bytes
  lastOpened: string;
  type: string;
  category: FileCategory[];
  keepPriority?: number; // 0-100
  relevanceTag?: RelevanceTag;
  relevanceReason?: string;
}

const GB = 1024 * 1024 * 1024;
const MB = 1024 * 1024;

export const mockFiles: SweepFile[] = [
  { id: '1', name: 'macOS Ventura Installer.app', path: '/Applications', size: 12.1 * GB, lastOpened: '2023-06-15', type: 'app', category: ['large', 'old'] },
  { id: '2', name: 'Xcode_14.3.xip', path: '~/Downloads', size: 7.8 * GB, lastOpened: '2023-03-20', type: 'archive', category: ['large', 'downloads', 'old'] },
  { id: '3', name: 'project-backup-final-v2.zip', path: '~/Documents/Backups', size: 4.2 * GB, lastOpened: '2023-09-01', type: 'archive', category: ['large', 'old'] },
  { id: '4', name: 'Screen Recording 2024-01-15.mov', path: '~/Desktop', size: 3.6 * GB, lastOpened: '2024-01-15', type: 'video', category: ['large'] },
  { id: '5', name: 'node_modules.zip', path: '~/Downloads', size: 2.9 * GB, lastOpened: '2023-11-10', type: 'archive', category: ['large', 'downloads', 'old'] },
  { id: '6', name: 'Figma Export Assets.zip', path: '~/Downloads', size: 1.8 * GB, lastOpened: '2024-06-20', type: 'archive', category: ['downloads'] },
  { id: '7', name: 'docker-images-backup.tar', path: '~/Documents', size: 5.4 * GB, lastOpened: '2023-04-12', type: 'archive', category: ['large', 'old'] },
  { id: '8', name: 'vacation-photos-raw.zip', path: '~/Downloads', size: 3.1 * GB, lastOpened: '2024-02-28', type: 'archive', category: ['large', 'downloads'] },
  { id: '9', name: 'Screenshot 2024-08-12 at 10.32.14.png', path: '~/Desktop/Screenshots', size: 4.8 * MB, lastOpened: '2024-08-12', type: 'image', category: ['screenshots'] },
  { id: '10', name: 'Screenshot 2024-07-03 at 14.55.01.png', path: '~/Desktop/Screenshots', size: 3.2 * MB, lastOpened: '2024-07-03', type: 'image', category: ['screenshots'] },
  { id: '11', name: 'Screenshot 2024-06-18 at 09.12.44.png', path: '~/Desktop/Screenshots', size: 5.1 * MB, lastOpened: '2024-06-18', type: 'image', category: ['screenshots'] },
  { id: '12', name: '6th grade gradebook 2016.xlsx', path: '~/Documents/School', size: 2.1 * MB, lastOpened: '2016-05-20', type: 'document', category: ['old'] },
  { id: '13', name: 'tax-return-2019-draft.pdf', path: '~/Documents/Finance', size: 8.4 * MB, lastOpened: '2019-04-15', type: 'document', category: ['old'] },
  { id: '14', name: 'report-final.pdf', path: '~/Documents', size: 45 * MB, lastOpened: '2023-08-15', type: 'document', category: ['old', 'duplicates'] },
  { id: '15', name: 'report-final.pdf', path: '~/Downloads', size: 45 * MB, lastOpened: '2023-08-15', type: 'document', category: ['downloads', 'duplicates'] },
  { id: '16', name: 'presentation-deck.pptx', path: '~/Documents', size: 120 * MB, lastOpened: '2023-05-20', type: 'document', category: ['old', 'duplicates'] },
  { id: '17', name: 'presentation-deck.pptx', path: '~/Downloads', size: 120 * MB, lastOpened: '2023-05-20', type: 'document', category: ['downloads', 'duplicates'] },
  { id: '18', name: 'old-resume-2022.docx', path: '~/Documents', size: 2.3 * MB, lastOpened: '2022-12-01', type: 'document', category: ['old'] },
  { id: '19', name: 'flutter_sdk_3.7.zip', path: '~/Downloads', size: 1.2 * GB, lastOpened: '2023-07-14', type: 'archive', category: ['downloads', 'old'] },
  { id: '20', name: 'Adobe Photoshop CC.dmg', path: '~/Downloads', size: 2.4 * GB, lastOpened: '2023-02-10', type: 'installer', category: ['large', 'downloads', 'old'] },
];

export const totalStorage = 512 * GB;
export const usedStorage = 287 * GB;

export function formatSize(bytes: number): string {
  if (bytes >= GB) return `${(bytes / GB).toFixed(1)} GB`;
  if (bytes >= MB) return `${(bytes / MB).toFixed(1)} MB`;
  return `${(bytes / 1024).toFixed(0)} KB`;
}

export function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export function getFileIcon(type: string): string {
  switch (type) {
    case 'app': return '📦';
    case 'archive': return '🗜️';
    case 'video': return '🎬';
    case 'image': return '🖼️';
    case 'document': return '📄';
    case 'installer': return '💿';
    default: return '📁';
  }
}

export function daysSince(dateStr: string): number {
  const date = new Date(dateStr);
  const now = new Date();
  return Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
}
