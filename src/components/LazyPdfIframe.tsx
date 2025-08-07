'use client';

import { useEffect, useRef, useState } from 'react';

export default function LazyPdfIframe({ pdfUrl }: { pdfUrl: string }) {
  const iframeRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin: '100px' } // preload ก่อนถึงนิดหน่อย
    );

    if (iframeRef.current) {
      observer.observe(iframeRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <div ref={iframeRef} className="w-full h-full border rounded shadow">
      {isVisible ? (
        <iframe
          src={pdfUrl}
          title="PDF Viewer"
          className="w-full h-full"
          style={{ border: 'none' }}
          loading="lazy"
          allowFullScreen
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center text-gray-500">
          Loading preview...
        </div>
      )}
    </div>
  );
}
