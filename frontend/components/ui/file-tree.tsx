'use client';

import { useState } from 'react';
import { ChevronRight, ChevronDown, File, Folder, FolderOpen } from 'lucide-react';

interface FileNode {
  name: string;
  path: string;
  type: 'file' | 'folder';
  children?: FileNode[];
}

interface FileTreeProps {
  files: string[];
}

function parseFileTree(files: string[]): FileNode[] {
  const root: FileNode[] = [];
  
  files.forEach(filePath => {
    const parts = filePath.split('/').filter(Boolean);
    let currentLevel = root;
    let currentPath = '';
    
    parts.forEach((part, index) => {
      currentPath = currentPath ? `${currentPath}/${part}` : part;
      const isFile = index === parts.length - 1;
      
      let existingNode = currentLevel.find(node => node.name === part);
      
      if (!existingNode) {
        existingNode = {
          name: part,
          path: currentPath,
          type: isFile ? 'file' : 'folder',
          children: isFile ? undefined : []
        };
        currentLevel.push(existingNode);
      }
      
      if (!isFile && existingNode.children) {
        currentLevel = existingNode.children;
      }
    });
  });
  
  return root;
}

function FileTreeNode({ node, depth = 0 }: { node: FileNode; depth?: number }) {
  const [isOpen, setIsOpen] = useState(depth < 2); // Auto-expand first 2 levels
  
  const isFolder = node.type === 'folder';
  const hasChildren = node.children && node.children.length > 0;
  
  const getFileIcon = (fileName: string) => {
    const ext = fileName.split('.').pop()?.toLowerCase();
    const colors: Record<string, string> = {
      'tsx': 'text-blue-400',
      'ts': 'text-blue-400',
      'jsx': 'text-cyan-400',
      'js': 'text-yellow-400',
      'json': 'text-yellow-300',
      'md': 'text-purple-400',
      'css': 'text-pink-400',
      'scss': 'text-pink-400',
      'html': 'text-orange-400',
      'env': 'text-green-400',
      'config': 'text-gray-400',
    };
    
    return colors[ext || ''] || 'text-zinc-400';
  };
  
  return (
    <div>
      <div
        className={`flex items-center gap-2 py-1 px-2 rounded hover:bg-zinc-800/50 cursor-pointer transition-colors ${
          depth === 0 ? 'font-semibold' : ''
        }`}
        style={{ paddingLeft: `${depth * 16 + 8}px` }}
        onClick={() => isFolder && setIsOpen(!isOpen)}
      >
        {isFolder ? (
          <>
            {hasChildren && (
              <span className="flex-shrink-0">
                {isOpen ? (
                  <ChevronDown className="w-4 h-4 text-zinc-400" />
                ) : (
                  <ChevronRight className="w-4 h-4 text-zinc-400" />
                )}
              </span>
            )}
            {isOpen ? (
              <FolderOpen className="w-4 h-4 text-indigo-400 flex-shrink-0" />
            ) : (
              <Folder className="w-4 h-4 text-indigo-400 flex-shrink-0" />
            )}
            <span className="text-zinc-200 text-sm">{node.name}</span>
          </>
        ) : (
          <>
            <span className="w-4 flex-shrink-0" />
            <File className={`w-4 h-4 flex-shrink-0 ${getFileIcon(node.name)}`} />
            <span className="text-zinc-300 text-sm">{node.name}</span>
          </>
        )}
      </div>
      
      {isFolder && isOpen && hasChildren && (
        <div>
          {node.children!.map((child, index) => (
            <FileTreeNode key={`${child.path}-${index}`} node={child} depth={depth + 1} />
          ))}
        </div>
      )}
    </div>
  );
}

export function FileTree({ files }: FileTreeProps) {
  const tree = parseFileTree(files);
  
  return (
    <div className="bg-black/30 rounded-lg p-4 overflow-x-auto">
      <div className="font-mono text-sm">
        {tree.map((node, index) => (
          <FileTreeNode key={`${node.path}-${index}`} node={node} />
        ))}
      </div>
    </div>
  );
}
