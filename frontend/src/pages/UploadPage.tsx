import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/Card';
import { Alert, AlertDescription } from '../components/ui/Alert';
import { Input } from '../components/ui/Input';
import { Label } from '../components/ui/Label';
import { filesApi, sharesApi } from '../lib/api';
import {
  generateKey,
  exportKey,
  encrypt,
  downloadKey,
} from '../lib/crypto';
import { Upload, FileText, Key, Link as LinkIcon } from 'lucide-react';

export default function UploadPage() {
  const [file, setFile] = useState<File | null>(null);
  const [encryptionKey, setEncryptionKey] = useState<string | null>(null);
  const [shareLink, setShareLink] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [expiresAt, setExpiresAt] = useState('');
  const [singleUse, setSingleUse] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      // Validate file type
      if (!selectedFile.name.endsWith('.env') && !selectedFile.name.includes('env')) {
        setError('Please select a .env file');
        return;
      }
      setFile(selectedFile);
      setError('');
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      if (!droppedFile.name.endsWith('.env') && !droppedFile.name.includes('env')) {
        setError('Please select a .env file');
        return;
      }
      setFile(droppedFile);
      setError('');
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setError('Please select a file');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Read file content
      const fileContent = await file.text();
      const fileBytes = new TextEncoder().encode(fileContent);

      // Generate encryption key
      const key = await generateKey();
      const keyBase64 = await exportKey(key);
      setEncryptionKey(keyBase64);

      // Encrypt file
      const { encrypted, iv } = await encrypt(fileBytes, key);

      // Upload to backend
      const fileResponse = await filesApi.upload({
        encryptedBlob: encrypted,
        iv,
        filenameMasked: file.name,
        expiresAt: expiresAt || undefined,
        singleUse,
      });

      // Create share
      const shareResponse = await sharesApi.create({
        fileId: fileResponse.data.id,
        expiresAt: expiresAt || undefined,
      });

      const link = `${window.location.origin}/download/${shareResponse.data.token}`;
      setShareLink(link);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Upload failed');
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadKey = () => {
    if (encryptionKey) {
      downloadKey(encryptionKey, `envvault-key-${Date.now()}.txt`);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Upload Secure .env File</h1>
        <p className="text-muted-foreground mt-2">
          Your file will be encrypted client-side before upload. The server never sees your plaintext.
        </p>
      </div>

      {!shareLink ? (
        <Card>
          <CardHeader>
            <CardTitle>Select File</CardTitle>
            <CardDescription>Drag and drop or click to select a .env file</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {error && (
              <Alert className="border-destructive bg-destructive/10">
                <AlertDescription className="text-destructive">{error}</AlertDescription>
              </Alert>
            )}

            <div
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              className="border-2 border-dashed rounded-lg p-12 text-center cursor-pointer hover:bg-accent transition-colors"
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-lg font-medium mb-2">
                {file ? file.name : 'Click or drag file here'}
              </p>
              <p className="text-sm text-muted-foreground">
                Only .env files are accepted
              </p>
              <input
                ref={fileInputRef}
                type="file"
                accept=".env,text/plain"
                onChange={handleFileSelect}
                className="hidden"
              />
            </div>

            {file && (
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-sm">
                  <FileText className="h-4 w-4" />
                  <span>{file.name}</span>
                  <span className="text-muted-foreground">
                    ({(file.size / 1024).toFixed(2)} KB)
                  </span>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="expiresAt">Expires At (Optional)</Label>
                  <Input
                    id="expiresAt"
                    type="datetime-local"
                    value={expiresAt}
                    onChange={(e) => setExpiresAt(e.target.value)}
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="singleUse"
                    checked={singleUse}
                    onChange={(e) => setSingleUse(e.target.checked)}
                    className="rounded"
                  />
                  <Label htmlFor="singleUse">Single use (file can only be downloaded once)</Label>
                </div>

                <Button onClick={handleUpload} disabled={loading} className="w-full">
                  {loading ? 'Encrypting and uploading...' : 'Encrypt & Upload'}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Upload Successful!</CardTitle>
              <CardDescription>Share this link and key with the recipient</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Share Link</Label>
                <div className="flex gap-2">
                  <Input value={shareLink} readOnly className="font-mono text-sm" />
                  <Button
                    variant="outline"
                    onClick={() => copyToClipboard(shareLink)}
                  >
                    <LinkIcon className="h-4 w-4 mr-2" />
                    Copy
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Encryption Key (Save this separately!)</Label>
                <div className="flex gap-2">
                  <Input
                    value={encryptionKey || ''}
                    readOnly
                    className="font-mono text-sm"
                    type="password"
                  />
                  <Button variant="outline" onClick={handleDownloadKey}>
                    <Key className="h-4 w-4 mr-2" />
                    Download Key
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  ⚠️ This key will not be shown again. Save it securely!
                </p>
              </div>

              <Alert>
                <AlertDescription>
                  <strong>Important:</strong> Share both the link and the encryption key with the
                  recipient. They need both to decrypt the file.
                </AlertDescription>
              </Alert>

              <div className="flex gap-2">
                <Button onClick={() => navigate('/dashboard')} variant="outline">
                  Go to Dashboard
                </Button>
                <Button onClick={() => window.location.reload()}>
                  Upload Another File
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}

