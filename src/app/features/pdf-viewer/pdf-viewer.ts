import { Component, ElementRef, Input, OnChanges, OnInit, SimpleChanges, ViewChild } from '@angular/core';
import * as pdfjsLib from 'pdfjs-dist';

@Component({
  selector: 'app-pdf-viewer',
  imports: [],
  templateUrl: './pdf-viewer.html',
  styleUrl: './pdf-viewer.css'
})
export class PdfViewer implements OnInit {

  @ViewChild('pdfCanvas', { static: true }) pdfCanvas!: ElementRef<HTMLCanvasElement>;
  
  @Input() pdfSrc!: string; // Input to receive the PDF file path
  private pdfUrl = '/assets/zpl.pdf'; // Path to your PDF file in assets
 
  @ViewChild("pdfContainer", { static: true }) pdfContainer!: ElementRef<HTMLDivElement>;
  

  private pdfDocument: any;
  private currentPageNumber = 1;
  private scale = 1.5;
  totalPages = 0;
  currentPage = 1;

  
  ngOnInit(): void {
    // 1. Set the worker source
    (pdfjsLib as any).GlobalWorkerOptions.workerSrc = '/assets/pdf.worker.min.mjs';
    //const pdfSource = `/assets/${this.pdfSrc}`
    //const pdfSource = `/assets/zpl.pdf`
    //console.log(this.pdfSrc);
    
    this.loadPdf(this.pdfSrc);
    
  } 
    async loadPdf(pdfFile: string) {
      try {
        const pdfjs = pdfjsLib as any;
        pdfjs.GlobalWorkerOptions.workerSrc = "/assets/pdf.worker.min.mjs";
  
        const loadingTask = pdfjs.getDocument(pdfFile); // Path to your PDF file.
        this.pdfDocument = await loadingTask.promise;
        this.totalPages = this.pdfDocument.numPages;
        this.renderPage(this.currentPageNumber);
      } catch (error) {
        console.error("Error loading PDF:", error);
      }
    }
  // Render a specific page of the PDF.
  async renderPage(pageNumber: number) {
    const page = await this.pdfDocument.getPage(pageNumber);
    const viewport = page.getViewport({ scale: this.scale });

    const container = this.pdfContainer.nativeElement;
    container.innerHTML = ""; // Clear previous content

    const canvas = document.createElement("canvas");
    container.appendChild(canvas);

    const context = canvas.getContext("2d")!;
    canvas.height = viewport.height;
    canvas.width = viewport.width;

    const renderContext = {
      canvasContext: context,
      viewport: viewport,
    };

    await page.render(renderContext).promise;
  }

  // Navigate to the previous page.
  goToPrevPage() {
    if (this.currentPageNumber > 1) {
      this.currentPageNumber--;
      this.currentPage = this.currentPageNumber;
      this.renderPage(this.currentPageNumber);
    }
  }

  // Navigate to the next page.
  goToNextPage() {
    if (this.currentPageNumber < this.totalPages) {
      this.currentPageNumber++;
      this.currentPage = this.currentPageNumber;
      this.renderPage(this.currentPageNumber);
    }
  }

  // Zoom in to the PDF.
  zoomIn() {
    this.scale += 0.25;
    this.renderPage(this.currentPageNumber);
  }

  // Zoom out of the PDF.
  zoomOut() {
    if (this.scale > 0.5) {
      this.scale -= 0.25;
      this.renderPage(this.currentPageNumber);
    }
  } 
  
  // ngOnChanges(changes: SimpleChanges): void {
  //   // 1. pdfSrc 속성에 변화가 있는지 확인합니다.
  //   if (changes['pdfSrc'] && changes['pdfSrc'].currentValue) {
  //     // 2. 새로운 URL로 PDF 로딩을 시작합니다.
  //     this.loadPdf(this.pdfSrc);
  //   }
  // }
  async loadPdf2(pdfSource: string) {
    try {
      // 2. Load the PDF document
      const loadingTask = pdfjsLib.getDocument(pdfSource);
      const pdf = await loadingTask.promise;

      // 3. Get the first page
      const pageNumber = 1;
      const page = await pdf.getPage(pageNumber);

      // 4. Set up the canvas for rendering
      const scale = 1.5;
      const viewport = page.getViewport({ scale: scale });

      
      const canvasEl = this.pdfCanvas.nativeElement;
      const context = canvasEl.getContext('2d');

      if (context) {
        canvasEl.height = viewport.height;
        canvasEl.width = viewport.width;

        // 5. Render the page to the canvas
        const renderContext = {
          canvasContext: context,
          viewport: viewport,
          canvas: canvasEl
        };

        await page.render(renderContext).promise;
        console.log('PDF Page rendered successfully!');
      }

    } catch (error) {
      console.error('Error loading or rendering PDF:', error);
    }
  }
  async loadAndRenderPdf2(pdfUrl: string) {
    const loadingTask = pdfjsLib.getDocument(pdfUrl);
    const pdf = await loadingTask.promise;

    // 🌟 페이지 수만큼 반복합니다.
    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
      const page = await pdf.getPage(pageNum);

      // 페이지마다 렌더링할 새로운 캔버스 요소를 생성하고 추가합니다.
      const canvas = document.createElement('canvas');
      canvas.className = 'pdf-page-canvas'; // 스타일을 위한 클래스 추가
      this.pdfCanvas.nativeElement.appendChild(canvas);

      const context = canvas.getContext('2d');
      if (!context) return;
      
      const scale = 1.5;
      const viewport = page.getViewport({ scale: scale });

      // 캔버스 크기 설정
      canvas.height = viewport.height;
      canvas.width = viewport.width;

      const renderContext = {
        canvasContext: context,
        viewport: viewport,
        // (선택 사항) 최신 버전의 pdfjs-dist를 사용하면 canvas 요소도 필요합니다.
        canvas: canvas, 
      };

      // 렌더링을 실행합니다.
      await page.render(renderContext).promise;
    }
  }
}
