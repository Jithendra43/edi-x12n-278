
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Folder, FileText, Search, X, TrendingUp } from 'lucide-react';
import { EDIFile, CustomSchema, ValidationResult } from '@/pages/Index';
import { useToast } from '@/hooks/use-toast';

interface HistoryItem {
  id: string;
  filename: string;
  uploadedAt: Date;
  status: 'completed' | 'failed' | 'processing';
  transactionCount: number;
  errorCount: number;
  warningCount: number;
  processingTime: number;
  fileSize: number;
  schemaUsed?: string;
  complianceScore: number;
  transactionId: string;
}

interface TransactionHistoryProps {
  currentFile?: EDIFile | null;
  customSchema?: CustomSchema | null;
  validationResults?: ValidationResult[];
}

const TransactionHistory: React.FC<TransactionHistoryProps> = ({ 
  currentFile, 
  customSchema, 
  validationResults = [] 
}) => {
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [filter, setFilter] = useState<'all' | 'completed' | 'failed'>('all');
  const { toast } = useToast();

  useEffect(() => {
    const loadHistory = () => {
      const baseHistory: HistoryItem[] = [
        {
          id: '2',
          filename: 'batch_278_requests.x12',
          uploadedAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
          status: 'completed',
          transactionCount: 5,
          errorCount: 1,
          warningCount: 3,
          processingTime: 3.8,
          fileSize: 12340,
          schemaUsed: '278 005010X217',
          complianceScore: 87,
          transactionId: 'TXN-2024-0001'
        },
        {
          id: '3',
          filename: 'test_invalid_format.txt',
          uploadedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
          status: 'failed',
          transactionCount: 0,
          errorCount: 5,
          warningCount: 0,
          processingTime: 0.3,
          fileSize: 2341,
          schemaUsed: 'Default 278',
          complianceScore: 0,
          transactionId: 'TXN-2024-0002'
        }
      ];

      // Add current session if available
      if (currentFile) {
        const currentSession: HistoryItem = {
          id: '1',
          filename: currentFile.name,
          uploadedAt: currentFile.uploadedAt,
          status: validationResults.length > 0 ? 'completed' : 'processing',
          transactionCount: 1,
          errorCount: validationResults.filter(r => r.type === 'error').length,
          warningCount: validationResults.filter(r => r.type === 'warning').length,
          processingTime: 1.2,
          fileSize: currentFile.size,
          schemaUsed: customSchema ? `${customSchema.transactionType} ${customSchema.version}` : 'Default 278',
          complianceScore: calculateComplianceScore(validationResults),
          transactionId: `TXN-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 10000)).padStart(4, '0')}`
        };
        
        setHistory([currentSession, ...baseHistory]);
      } else {
        setHistory(baseHistory);
      }
    };

    loadHistory();
  }, [currentFile, customSchema, validationResults]);

  const calculateComplianceScore = (results: ValidationResult[]) => {
    if (results.length === 0) return 100;
    
    const totalIssues = results.length;
    const errorWeight = 3;
    const warningWeight = 1;
    
    const errorCount = results.filter(r => r.type === 'error').length;
    const warningCount = results.filter(r => r.type === 'warning').length;
    
    const weightedScore = (errorCount * errorWeight) + (warningCount * warningWeight);
    const maxPossibleScore = totalIssues * errorWeight;
    
    return Math.max(0, Math.round(100 - (weightedScore / maxPossibleScore) * 100));
  };

  const filteredHistory = history.filter(item => 
    filter === 'all' || item.status === filter
  );

  const handleReprocess = (item: HistoryItem) => {
    toast({
      title: "Reprocessing initiated",
      description: `${item.filename} will be reprocessed with current validation rules`,
    });
  };

  const handleViewDetails = (item: HistoryItem) => {
    toast({
      title: "View details",
      description: `Opening detailed report for ${item.filename}`,
    });
  };

  const handleDelete = (item: HistoryItem) => {
    setHistory(prev => prev.filter(h => h.id !== item.id));
    toast({
      title: "Item removed",
      description: `${item.filename} has been removed from history`,
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800 border-green-200';
      case 'failed': return 'bg-red-100 text-red-800 border-red-200';
      case 'processing': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getComplianceColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 70) return 'text-amber-600';
    return 'text-red-600';
  };

  const formatFileSize = (bytes: number) => {
    return `${Math.round(bytes / 1024)}KB`;
  };

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Less than an hour ago';
    if (diffInHours < 24) return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
    
    const diffInWeeks = Math.floor(diffInDays / 7);
    return `${diffInWeeks} week${diffInWeeks > 1 ? 's' : ''} ago`;
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-center flex items-center justify-center gap-2">
            <Folder className="w-5 h-5" />
            Transaction Processing History
          </CardTitle>
          <CardDescription className="text-center">
            View and manage your processed EDI files with detailed analytics and reprocessing options
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex gap-2">
                <Button
                  variant={filter === 'all' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFilter('all')}
                >
                  All ({history.length})
                </Button>
                <Button
                  variant={filter === 'completed' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFilter('completed')}
                  className={filter === 'completed' ? 'bg-green-600 hover:bg-green-700' : ''}
                >
                  Completed ({history.filter(h => h.status === 'completed').length})
                </Button>
                <Button
                  variant={filter === 'failed' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFilter('failed')}
                  className={filter === 'failed' ? 'bg-red-600 hover:bg-red-700' : ''}
                >
                  Failed ({history.filter(h => h.status === 'failed').length})
                </Button>
              </div>
              
              <div className="text-sm text-gray-600">
                {filteredHistory.length} item{filteredHistory.length !== 1 ? 's' : ''}
              </div>
            </div>

            {filteredHistory.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Search className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p>No transaction history found</p>
                <p className="text-sm">Process some EDI files to see them here</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {filteredHistory.map((item) => (
                  <div key={item.id} className="p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <FileText className="w-4 h-4 text-gray-600" />
                          <span className="font-medium text-gray-900">{item.filename}</span>
                          <Badge className={`text-xs ${getStatusColor(item.status)}`}>
                            {item.status.toUpperCase()}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            {item.transactionId}
                          </Badge>
                        </div>
                        
                        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm text-gray-600 mb-3">
                          <div>
                            <span className="font-medium">Transactions:</span> {item.transactionCount}
                          </div>
                          <div>
                            <span className="font-medium">Errors:</span> {item.errorCount}
                          </div>
                          <div>
                            <span className="font-medium">Warnings:</span> {item.warningCount}
                          </div>
                          <div>
                            <span className="font-medium">Size:</span> {formatFileSize(item.fileSize)}
                          </div>
                          <div>
                            <span className="font-medium">Compliance:</span> 
                            <span className={`ml-1 font-bold ${getComplianceColor(item.complianceScore)}`}>
                              {item.complianceScore}%
                            </span>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-4 text-xs text-gray-500">
                          <span>Processed {formatTimeAgo(item.uploadedAt)}</span>
                          <span>•</span>
                          <span>Processing time: {item.processingTime}s</span>
                          <span>•</span>
                          <span>Schema: {item.schemaUsed}</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2 ml-4">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleViewDetails(item)}
                        >
                          View Details
                        </Button>
                        {item.status === 'completed' && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleReprocess(item)}
                          >
                            Reprocess
                          </Button>
                        )}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(item)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {history.length > 0 && (
        <Card className="bg-blue-50 border-blue-200">
          <CardHeader>
            <CardTitle className="text-center text-blue-800 flex items-center justify-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Processing Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-800">
                  {history.reduce((sum, item) => sum + item.transactionCount, 0)}
                </div>
                <div className="text-blue-600">Total Transactions</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {history.filter(h => h.status === 'completed').length}
                </div>
                <div className="text-green-600">Successful Files</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">
                  {history.reduce((sum, item) => sum + item.errorCount, 0)}
                </div>
                <div className="text-red-600">Total Errors</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-amber-600">
                  {Math.round(history.reduce((sum, item) => sum + item.complianceScore, 0) / history.length)}%
                </div>
                <div className="text-amber-600">Avg Compliance</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default TransactionHistory;
