import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { LabSettingsService } from './services/lab-settings.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet],
  template: `
    <div class="app-container">
      <header>
        <h1>Sistema de Laboratorio</h1>
      </header>
      
      <main>
        <router-outlet></router-outlet>
      </main>
      
      <footer>
        <p>© 2025 Laboratorio Clínico</p>
      </footer>
    </div>
  `,
  styles: [`
    .app-container {
      min-height: 100vh;
      display: flex;
      flex-direction: column;
    }
    
    header {
      background: #f8f9fa;
      padding: 1rem;
      border-bottom: 1px solid #dee2e6;
    }
    
    h1 {
      margin: 0;
      font-size: 1.5rem;
      color: #495057;
    }
    
    main {
      flex: 1;
      padding: 2rem;
    }
    
    footer {
      background: #f8f9fa;
      padding: 1rem;
      text-align: center;
      border-top: 1px solid #dee2e6;
      color: #6c757d;
    }
  `]
})
export class AppComponent implements OnInit {
  private labSettings = inject(LabSettingsService);
  title = 'Sistema de Laboratorio';

  ngOnInit(): void {
    this.labSettings.loadSettings();
  }
}