import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { TestProfile, CreateTestProfileDto, UpdateTestProfileDto } from '../../../models/test-profile.interface';
import { TestProfileService } from '../../../services/test-profile.service';
import { TestSection } from '../../../models/test-section.interface';
import { TestDefinition } from '../../../models/test-definition.interface';
import { TestDefinitionService } from '../../../services/test-definition.service';

@Component({
  selector: 'app-test-profile-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './test-profile-form.component.html',
  styleUrls: ['./test-profile-form.component.css']
})
export class TestProfileFormComponent implements OnInit {
  @Input() testProfile?: TestProfile;
  @Input() categories: TestSection[] = [];
  @Output() saved = new EventEmitter<TestProfile>();
  @Output() cancelled = new EventEmitter<void>();

  profileForm!: FormGroup;
  isEditMode = false;
  isSubmitting = false;
  submitError: string | null = null;
  submitSuccess: string | null = null;
  submitAttempted = false;

  availableTests: TestDefinition[] = [];
  selectedTestIds: string[] = [];
  loadingTests = false;

  constructor(
    private fb: FormBuilder,
    private profileService: TestProfileService,
    private testDefinitionService: TestDefinitionService
  ) {}

  ngOnInit(): void {
    this.isEditMode = !!this.testProfile;
    this.initForm();
    
    if (this.testProfile) {
      // Extract test IDs from profile's tests array
      if (this.testProfile.tests && this.testProfile.tests.length > 0) {
        // If tests have id property, extract them
        this.selectedTestIds = this.testProfile.tests
          .filter(test => test && test.id)
          .map(test => test.id);
      }
    }
  }

  initForm(): void {
    this.profileForm = this.fb.group({
      name: [
        this.testProfile?.name || '', 
        [Validators.required, Validators.minLength(2), Validators.maxLength(150)]
      ],
      code: [
        this.testProfile?.code || '', 
        [Validators.maxLength(20)]
      ],
      description: [this.testProfile?.description || ''],
      price: [
        this.testProfile?.price || 0, 
        [Validators.min(0)]
      ],
      displayOrder: [this.testProfile?.displayOrder || 0],
      isActive: [this.testProfile?.isActive !== undefined ? this.testProfile.isActive : true]
    });
  }

  onSectionChange(): void {
    const sectionId = this.profileForm.get('sectionId')?.value;
    if (sectionId) {
      this.loadTestsBySection(sectionId);
    } else {
      this.availableTests = [];
    }
    // Reset selected tests when category changes
    if (!this.isEditMode) {
      this.selectedTestIds = [];
    }
  }

  loadTestsBySection(sectionId: number): void {
    this.loadingTests = true;
    this.testDefinitionService.getTestDefinitionsBySection(sectionId.toString()).subscribe({
      next: (tests) => {
        this.availableTests = tests;
        this.loadingTests = false;
      },
      error: (err) => {
        console.error('Error loading tests:', err);
        this.availableTests = [];
        this.loadingTests = false;
      }
    });
  }

  isTestSelected(testId: string): boolean {
    return this.selectedTestIds.includes(testId);
  }

  toggleTest(testId: string): void {
    const index = this.selectedTestIds.indexOf(testId);
    if (index > -1) {
      this.selectedTestIds.splice(index, 1);
    } else {
      this.selectedTestIds.push(testId);
    }
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.profileForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  onSubmit(): void {
    this.submitAttempted = true;

    if (this.profileForm.invalid || this.selectedTestIds.length === 0) {
      Object.keys(this.profileForm.controls).forEach(key => {
        this.profileForm.get(key)?.markAsTouched();
      });
      return;
    }

    this.isSubmitting = true;
    this.submitError = null;
    this.submitSuccess = null;

    const formValue = this.profileForm.value;

    if (this.isEditMode && this.testProfile) {
      const updateData: UpdateTestProfileDto = {
        id: formValue.sectionId,
        name: formValue.name,
        code: formValue.code || undefined,
        description: formValue.description || undefined,
        testDefinitions: this.selectedTestIds,
        price: formValue.price || undefined,
        displayOrder: formValue.displayOrder,
        isActive: formValue.isActive
      };

      this.profileService.updateTestProfile(this.testProfile.id.toString(), updateData)
        .subscribe({
          next: (updatedProfile) => {
            this.submitSuccess = 'Perfil actualizado exitosamente';
            setTimeout(() => {
              this.saved.emit(updatedProfile);
            }, 1000);
          },
          error: (err) => {
            this.submitError = err.message || 'Error al actualizar el perfil';
            this.isSubmitting = false;
          }
        });
    } else {
      const createData: CreateTestProfileDto = {
        name: formValue.name,
        code: formValue.code || undefined,
        description: formValue.description || undefined,
        testDefinitions: this.selectedTestIds,
        price: formValue.price || undefined,
        displayOrder: formValue.displayOrder
      };

      this.profileService.createTestProfile(createData)
        .subscribe({
          next: (newProfile) => {
            this.submitSuccess = 'Perfil creado exitosamente';
            setTimeout(() => {
              this.saved.emit(newProfile);
            }, 1000);
          },
          error: (err) => {
            this.submitError = err.message || 'Error al crear el perfil';
            this.isSubmitting = false;
          }
        });
    }
  }

  onCancel(): void {
    this.cancelled.emit();
  }
}
