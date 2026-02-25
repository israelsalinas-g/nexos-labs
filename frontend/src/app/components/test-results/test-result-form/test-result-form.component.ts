import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { TestResult, CreateTestResultDto, UpdateTestResultDto } from '../../../models/test-result.interface';
import { TestResultService } from '../../../services/test-result.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-test-result-form',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule],
  templateUrl: './test-result-form.component.html',
  styleUrls: ['./test-result-form.component.css']
})
export class TestResultFormComponent implements OnInit, OnDestroy {
  result: TestResult | null = null;
  loading = false;
  error: string | null = null;
  isEditMode = false;
  form!: FormGroup;
  submitting = false;
  
  private resultId: string | null = null;
  private destroy$ = new Subject<void>();

  constructor(
    private resultService: TestResultService,
    private route: ActivatedRoute,
    private router: Router,
    private formBuilder: FormBuilder
  ) {
    this.form = this.formBuilder.group({});
  }

  ngOnInit(): void {
    this.route.params.pipe(takeUntil(this.destroy$)).subscribe(params => {
      this.resultId = params['id'] || null;
      this.isEditMode = !!this.resultId;

      if (this.isEditMode && this.resultId) {
        this.loadResult();
      }
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadResult(): void {
    this.loading = true;
    const resultIdNum = Number(this.resultId);
    
    this.resultService.getResultById(resultIdNum)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (result: TestResult) => {
          this.result = result;
          this.loading = false;
        },
        error: (err: any) => {
          this.error = 'Error cargando el resultado.';
          this.loading = false;
          console.error('Error loading result:', err);
        }
      });
  }

  goBack(): void {
    this.router.navigate(['/test-results']);
  }
}
