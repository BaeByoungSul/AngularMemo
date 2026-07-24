import { Component } from '@angular/core';
import { NgxExtendedPdfViewerModule } from 'ngx-extended-pdf-viewer';

@Component({
  selector: 'app-pdf-test',
  imports: [
    NgxExtendedPdfViewerModule
  ],
  templateUrl: './pdf-test.html',
  styleUrl: './pdf-test.css'
})
export class PdfTest {
  workerSrc = '/assets/pdf.worker.mjs';
pdfSrc = '/assets/ccc.pdf';
}
