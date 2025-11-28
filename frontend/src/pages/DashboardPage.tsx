import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/Card';
import { filesApi, sharesApi, auditApi } from '../lib/api';
import { FileText, Link as LinkIcon, Trash2, Eye, Calendar } from 'lucide-react';

interface File {
  id: string;
  filenameMasked: string;
  size: number;
  createdAt: string;
  expiresAt: string | null;
  singleUse: boolean;
  accessCount: number;
  shares: Array<{
    id: string;
    expiresAt: string | null;
    revoked: boolean;
    usageLimit: number | null;
    createdAt: string;
    _count: { auditLogs: number };
  }>;
}

export default function DashboardPage() {
  const [files, setFiles] = useState<File[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);

  useEffect(() => {
    fetchFiles();
  }, []);

  const fetchFiles = async () => {
    try {
      const response = await filesApi.getAll();
      setFiles(response.data);
    } catch (err) {
      console.error('Failed to fetch files:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRevokeShare = async (shareId: string) => {
    try {
      await sharesApi.revoke(shareId);
      fetchFiles();
    } catch (err) {
      console.error('Failed to revoke share:', err);
    }
  };

  const handleViewAudit = async (fileId: string) => {
    try {
      const response = await auditApi.getFileLogs(fileId);
      setAuditLogs(response.data);
      const file = files.find((f) => f.id === fileId);
      setSelectedFile(file || null);
    } catch (err) {
      console.error('Failed to fetch audit logs:', err);
    }
  };

  if (loading) {
    return <div className="text-center py-12">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground mt-2">Manage your encrypted .env files</p>
        </div>
        <Link to="/upload">
          <Button>Upload New File</Button>
        </Link>
      </div>

      {files.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-lg font-medium mb-2">No files yet</p>
            <p className="text-muted-foreground mb-4">
              Upload your first secure .env file to get started
            </p>
            <Link to="/upload">
              <Button>Upload File</Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {files.map((file) => (
            <Card key={file.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    <CardTitle>{file.filenameMasked}</CardTitle>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleViewAudit(file.id)}
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      Audit
                    </Button>
                  </div>
                </div>
                <CardDescription>
                  Uploaded {new Date(file.createdAt).toLocaleDateString()} •{' '}
                  {(file.size / 1024).toFixed(2)} KB • {file.accessCount} downloads
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center gap-4 text-sm">
                    {file.expiresAt && (
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        <span>Expires: {new Date(file.expiresAt).toLocaleDateString()}</span>
                      </div>
                    )}
                    {file.singleUse && (
                      <span className="px-2 py-1 bg-destructive/10 text-destructive rounded text-xs">
                        Single Use
                      </span>
                    )}
                  </div>

                  {file.shares.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="font-medium text-sm">Active Shares</h4>
                      {file.shares.map((share) => (
                        <div
                          key={share.id}
                          className="flex items-center justify-between p-2 bg-muted rounded"
                        >
                          <div className="flex items-center gap-2 text-sm">
                            <LinkIcon className="h-4 w-4" />
                            <span>
                              Created {new Date(share.createdAt).toLocaleDateString()} •{' '}
                              {share._count.auditLogs} accesses
                            </span>
                            {share.revoked && (
                              <span className="px-2 py-1 bg-destructive/10 text-destructive rounded text-xs">
                                Revoked
                              </span>
                            )}
                          </div>
                          {!share.revoked && (
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => handleRevokeShare(share.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {selectedFile && auditLogs.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Audit Logs - {selectedFile.filenameMasked}</CardTitle>
            <CardDescription>Access history for this file</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {auditLogs.map((log) => (
                <div key={log.id} className="flex items-center justify-between p-2 bg-muted rounded text-sm">
                  <div>
                    <span className="font-medium">{log.action}</span>
                    {log.ip && <span className="text-muted-foreground ml-2">({log.ip})</span>}
                  </div>
                  <span className="text-muted-foreground">
                    {new Date(log.timestamp).toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
            <Button
              variant="outline"
              className="mt-4"
              onClick={() => {
                setSelectedFile(null);
                setAuditLogs([]);
              }}
            >
              Close
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

