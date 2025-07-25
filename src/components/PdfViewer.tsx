// PdfViewer.tsx
import { Viewer, Worker, SpecialZoomLevel } from '@react-pdf-viewer/core';
import { defaultLayoutPlugin } from '@react-pdf-viewer/default-layout';
import '@react-pdf-viewer/core/lib/styles/index.css';
import '@react-pdf-viewer/default-layout/lib/styles/index.css';

const PdfViewer = ({ url }: { url: string }) => {
  const defaultLayoutPluginInstance = defaultLayoutPlugin();
  return (
    <Worker workerUrl="/pdf.worker.min.js">
      <Viewer
        fileUrl={url}
        defaultScale={SpecialZoomLevel.PageWidth}
        plugins={[defaultLayoutPluginInstance]}
      />
    </Worker>
  );
};

export default PdfViewer;
