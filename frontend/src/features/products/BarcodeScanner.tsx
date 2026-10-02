import CameraAltOutlined from '@mui/icons-material/CameraAltOutlined';
import { Alert, Box, Button, Card, CircularProgress, TextField, Typography } from '@mui/material';
import { BarcodeFormat, DecodeHintType } from '@zxing/library';
import { BrowserMultiFormatReader, type IScannerControls } from '@zxing/browser';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useToast } from '../../components/Common/ToastProvider';
import { productApi } from '../../services/productApi';
import type { ProductLookup, ProductPrefill } from '../../types/product';

interface Props {
  /** Called when the user confirms a scanned code; switches the page to the form. */
  onConfirm: (prefill: ProductPrefill) => void;
  onManual: () => void;
}

const FORMATS = [
  BarcodeFormat.QR_CODE, BarcodeFormat.EAN_13, BarcodeFormat.EAN_8,
  BarcodeFormat.UPC_A, BarcodeFormat.UPC_E, BarcodeFormat.CODE_128,
];

/** Camera scanner → lookup → user confirmation. Never requires the lookup to succeed. */
export function BarcodeScanner({ onConfirm, onManual }: Props) {
  const toast = useToast();
  const videoRef = useRef<HTMLVideoElement>(null);
  const controlsRef = useRef<IScannerControls | null>(null);
  const attemptRef = useRef(0);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [starting, setStarting] = useState(true);
  const [code, setCode] = useState<string | null>(null);
  const [lookup, setLookup] = useState<ProductLookup | null>(null);
  const [lookingUp, setLookingUp] = useState(false);
  const [manualCode, setManualCode] = useState('');

  const stopCamera = useCallback(() => {
    attemptRef.current++; // invalidates any start that is still in flight
    controlsRef.current?.stop();
    controlsRef.current = null;
  }, []);

  const handleCode = useCallback(async (value: string) => {
    stopCamera();
    setCode(value);
    setLookingUp(true);
    try {
      setLookup(await productApi.lookup(value));
    } catch {
      setLookup({ barcode: value, found: false, name: null, brand: null, modelNumber: null, categoryId: null });
      toast.info('Could not look up product details. You can continue manually.');
    } finally {
      setLookingUp(false);
    }
  }, [stopCamera, toast]);

  const startCamera = useCallback(async () => {
    setCameraError(null);
    setStarting(true);
    if (!navigator.mediaDevices?.getUserMedia) {
      setCameraError('Camera is not available. Use HTTPS (or localhost) and a browser with camera support, or type the code below.');
      setStarting(false);
      return;
    }
    try {
      const hints = new Map<DecodeHintType, unknown>([
        [DecodeHintType.POSSIBLE_FORMATS, FORMATS],
        [DecodeHintType.TRY_HARDER, true],
      ]);
      // Small delay between attempts keeps decoding responsive; 1D barcodes need a high-resolution frame.
      const reader = new BrowserMultiFormatReader(hints, { delayBetweenScanAttempts: 100 });
      const attempt = ++attemptRef.current;
      const controls = await reader.decodeFromConstraints(
        {
          video: {
            facingMode: { ideal: 'environment' },
            width: { ideal: 1920 },
            height: { ideal: 1080 },
          },
        },
        videoRef.current!,
        (result) => {
          if (result) void handleCode(result.getText());
        },
      );
      if (attempt !== attemptRef.current) {
        // A newer start (StrictMode remount) or unmount superseded this one.
        controls.stop();
        return;
      }
      controlsRef.current = controls;
    } catch (e) {
      const denied = e instanceof DOMException && e.name === 'NotAllowedError';
      setCameraError(denied
        ? 'Camera permission was denied. Allow camera access in your browser, or type the code below.'
        : 'Unable to start the camera. You can type the code below or enter the product manually.');
    } finally {
      setStarting(false);
    }
  }, [handleCode]);

  useEffect(() => {
    void startCamera();
    return stopCamera;
  }, [startCamera, stopCamera]);

  const rescan = () => {
    setCode(null);
    setLookup(null);
    void startCamera();
  };

  const confirm = () => {
    if (!code) return;
    onConfirm({
      barcode: code,
      name: lookup?.name ?? undefined,
      brand: lookup?.brand ?? undefined,
      modelNumber: lookup?.modelNumber ?? undefined,
      categoryId: lookup?.categoryId ?? undefined,
    });
  };

  if (code) {
    return (
      <Card sx={{ p: { xs: 2, md: 3 } }}>
        <Typography variant="body2" color="text.secondary">Scanned value</Typography>
        <Typography data-testid="scanned-value" sx={{ fontFamily: 'monospace', fontSize: '1.2rem', fontWeight: 700, wordBreak: 'break-all', mb: 2 }}>
          {code}
        </Typography>
        {lookingUp ? (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
            <CircularProgress size={20} /> <Typography variant="body2">Looking up product...</Typography>
          </Box>
        ) : lookup?.found ? (
          <Alert severity="success" sx={{ mb: 2 }}>
            Product found: <strong>{lookup.name}</strong>{lookup.brand ? ` (${lookup.brand})` : ''}. Confirm to pre-fill the form.
          </Alert>
        ) : (
          <Alert severity="info" sx={{ mb: 2 }}>
            No product information found for this code. You can continue manually — the code will still be saved with the product.
          </Alert>
        )}
        <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap' }}>
          <Button variant="contained" onClick={confirm} disabled={lookingUp}>
            {lookup?.found ? 'Use this product' : 'Continue manually'}
          </Button>
          <Button variant="outlined" color="inherit" onClick={rescan}>Scan again</Button>
        </Box>
      </Card>
    );
  }

  return (
    <Card sx={{ p: { xs: 2, md: 3 } }}>
      {cameraError && <Alert severity="warning" sx={{ mb: 2 }}>{cameraError}</Alert>}
      <Box
        sx={{
          position: 'relative', bgcolor: '#111', borderRadius: 3, overflow: 'hidden', aspectRatio: '4 / 3',
          maxHeight: 420, width: '100%', display: cameraError ? 'none' : 'block',
        }}
      >
        <video ref={videoRef} muted playsInline style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        <Box sx={{ position: 'absolute', inset: '18% 12%', border: '3px solid', borderColor: 'primary.main', borderRadius: 2, pointerEvents: 'none' }} />
        {starting && (
          <Box sx={{ position: 'absolute', inset: 0, display: 'grid', placeItems: 'center', color: '#fff' }}>
            <Box sx={{ textAlign: 'center' }}><CameraAltOutlined /><Typography variant="body2">Starting camera...</Typography></Box>
          </Box>
        )}
      </Box>
      <Typography align="center" color="text.secondary" variant="body2" sx={{ mt: 1.5 }}>
        Point your camera at the QR code or barcode
      </Typography>

      <Box sx={{ display: 'flex', gap: 1, mt: 2.5, alignItems: 'flex-start' }}>
        <TextField
          label="Or type the code"
          value={manualCode}
          onChange={(e) => setManualCode(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter' && manualCode.trim()) { e.preventDefault(); void handleCode(manualCode.trim()); } }}
        />
        <Button variant="outlined" disabled={!manualCode.trim()} onClick={() => void handleCode(manualCode.trim())} sx={{ whiteSpace: 'nowrap', height: 40 }}>
          Look up
        </Button>
      </Box>

      <Box sx={{ textAlign: 'center', mt: 2.5 }}>
        <Button variant="outlined" color="inherit" onClick={onManual}>Enter Manually Instead</Button>
      </Box>
    </Card>
  );
}
