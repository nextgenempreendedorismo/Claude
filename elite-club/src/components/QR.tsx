import QRCode from 'qrcode'
import { useEffect, useState } from 'react'

export function useQR(text: string) {
  const [src, setSrc] = useState('')
  useEffect(() => {
    QRCode.toDataURL(text, { margin: 1, width: 480, color: { dark: '#14110d', light: '#ffffff' } })
      .then(setSrc)
      .catch(() => setSrc(''))
  }, [text])
  return src
}

export function QRImage({ text, size = 160 }: { text: string; size?: number }) {
  const src = useQR(text)
  return src ? <img src={src} alt="QR Code" width={size} height={size} /> : null
}
