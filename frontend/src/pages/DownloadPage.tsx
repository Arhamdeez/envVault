import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/Card';
import { Alert, AlertDescription } from '../components/ui/Alert';
import { Input } from '../components/ui/Input';
import { Label } from '../components/ui/Label';
import { sharesApi } from '../lib/api';
import { importKey, decrypt, downloadFile } from '../lib/crypto';
import { Download, Lock, FileText } from 'lucide-react';

export default function DownloadPage() {
  const { token } = useParams<{ token?: string }>();
  const [shareToken, setShareToken] = useState(token || '');
  const [decryptionKey, setDecryptionKey] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [fileInfo, setFileInfo] = useState<{
    filenameMasked: string;
    size: number;
  } | null>(null);
  const [decryptedContent, setDecryptedContent] = useState<string | null>(null);

  useEffect(() => {
    if (token) {
      fetchFileInfo();
    }
  }, [token]);

  const fetchFileInfo = async () => {
    if (!shareToken) return;

    try {
      const response = await sharesApi.download(shareToken);
      setFileInfo({
        filenameMasked: response.data.filenameMasked,
        size: response.data.size,
      });
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch file');
    }
  };

  const handleDecrypt = async () => {
    if (!shareToken || !decryptionKey) {
      setError('Please provide both share token and decryption key');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Download encrypted blob
      const response = await sharesApi.download(shareToken);

      // Import key
      const key = await importKey(decryptionKey);

      // Decrypt
      const decryptedBytes = await decrypt(
        response.data.encryptedBlob,
        response.data.iv,
        key,
      );

      // Convert to text
      const decryptedText = new TextDecoder().decode(decryptedBytes);
      setDecryptedContent(decryptedText);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Decryption failed. Please check your key.');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = () => {
    if (decryptedContent && fileInfo) {
      downloadFile(decryptedContent, fileInfo.filenameMasked);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="text-center mb-8">
        <Lock className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
        <h1 className="text-3xl font-bold">Download Secure File</h1>
        <p className="text-muted-foreground mt-2">
          Decrypt and download your .env file using the share token and encryption key
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Enter Share Details</CardTitle>
          <CardDescription>
            You need both the share token and the decryption key to download the file
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <Alert className="border-destructive bg-destructive/10">
              <AlertDescription className="text-destructive">{error}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label htmlFor="token">Share Token</Label>
            <Input
              id="token"
              value={shareToken}
              onChange={(e) => setShareToken(e.target.value)}
              placeholder="Enter share token from the link"
              className="font-mono text-sm"
            />
            {token && (
              <p className="text-xs text-muted-foreground">
                Token extracted from URL. You can modify it if needed.
              </p>
            )}
          </div>

          {fileInfo && (
            <div className="flex items-center gap-2 text-sm p-3 bg-muted rounded-md">
              <FileText className="h-4 w-4" />
              <span>{fileInfo.filenameMasked}</span>
              <span className="text-muted-foreground">
                ({(fileInfo.size / 1024).toFixed(2)} KB)
              </span>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="key">Decryption Key</Label>
            <Input
              id="key"
              type="password"
              value={decryptionKey}
              onChange={(e) => setDecryptionKey(e.target.value)}
              placeholder="Enter the encryption key provided by the sender"
              className="font-mono text-sm"
            />
            <p className="text-xs text-muted-foreground">
              Paste the base64 encryption key you received
            </p>
          </div>

          {!decryptedContent ? (
            <div className="flex gap-2">
              <Button onClick={handleDecrypt} disabled={loading || !shareToken || !decryptionKey}>
                {loading ? 'Decrypting...' : 'Decrypt File'}
              </Button>
              {shareToken && !fileInfo && (
                <Button variant="outline" onClick={fetchFileInfo}>
                  Fetch File Info
                </Button>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              <Alert>
                <AlertDescription>
                  File decrypted successfully! Review the content below and download when ready.
                </AlertDescription>
              </Alert>

              <div className="space-y-2">
                <Label>Decrypted Content (Preview)</Label>
                <textarea
                  readOnly
                  value={decryptedContent}
                  className="w-full h-48 p-3 border rounded-md font-mono text-xs bg-muted"
                />
              </div>

              <Button onClick={handleDownload} className="w-full">
                <Download className="h-4 w-4 mr-2" />
                Download Decrypted .env File
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

