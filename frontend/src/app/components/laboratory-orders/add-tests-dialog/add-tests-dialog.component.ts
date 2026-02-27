import {
  Component, inject, signal, computed, OnInit,
  ChangeDetectionStrategy,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { TestDefinition } from '../../../models/test-definition.interface';
import { TestProfile } from '../../../models/test-profile.interface';
import { Promotion } from '../../../models/promotion.interface';
import { TestDefinitionService } from '../../../services/test-definition.service';
import { TestProfileService } from '../../../services/test-profile.service';
import { PromotionService } from '../../../services/promotion.service';
import { LaboratoryOrderService } from '../../../services/laboratory-order.service';

type Tab = 'tests' | 'profiles' | 'promotions';

interface SelectedItem {
  type: 'test' | 'profile' | 'promotion';
  id: string | number;
  name: string;
  price?: string | number;
}

@Component({
  selector: 'app-add-tests-dialog',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, FormsModule],
  templateUrl: './add-tests-dialog.component.html',
  styleUrls: ['./add-tests-dialog.component.css'],
})
export class AddTestsDialogComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private testService = inject(TestDefinitionService);
  private profileService = inject(TestProfileService);
  private promotionService = inject(PromotionService);
  private orderService = inject(LaboratoryOrderService);

  orderId = signal<string | null>(null);
  activeTab = signal<Tab>('tests');

  allTests = signal<TestDefinition[]>([]);
  allProfiles = signal<TestProfile[]>([]);
  allPromotions = signal<Promotion[]>([]);

  loadingTests = signal(true);
  loadingProfiles = signal(false);
  loadingPromotions = signal(false);

  testSearch = signal('');
  profileSearch = signal('');
  promotionSearch = signal('');

  selectedItems = signal<SelectedItem[]>([]);
  submitting = signal(false);
  error = signal<string | null>(null);
  success = signal(false);

  filteredTests = computed(() => {
    const q = this.testSearch().toLowerCase();
    return this.allTests().filter(t =>
      t.name.toLowerCase().includes(q) || (t.code ?? '').toLowerCase().includes(q),
    );
  });

  filteredProfiles = computed(() => {
    const q = this.profileSearch().toLowerCase();
    return this.allProfiles().filter(p =>
      p.name.toLowerCase().includes(q) || (p.code ?? '').toLowerCase().includes(q),
    );
  });

  filteredPromotions = computed(() => {
    const q = this.promotionSearch().toLowerCase();
    return this.allPromotions().filter(p => p.name.toLowerCase().includes(q));
  });

  totalPrice = computed(() =>
    this.selectedItems().reduce((sum, i) => sum + parseFloat(String(i.price ?? 0)), 0),
  );

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.orderId.set(params['id']);
      this.loadCatalog();
    });
  }

  private loadCatalog(): void {
    this.loadingTests.set(true);
    this.testService.getTestDefinitions({ limit: 999 }).subscribe({
      next: r => { this.allTests.set(r.data); this.loadingTests.set(false); },
      error: () => this.loadingTests.set(false),
    });

    this.loadingProfiles.set(true);
    this.profileService.getTestProfiles({ limit: 999 }).subscribe({
      next: r => { this.allProfiles.set(r.data); this.loadingProfiles.set(false); },
      error: () => this.loadingProfiles.set(false),
    });

    this.loadingPromotions.set(true);
    this.promotionService.getAllActive().subscribe({
      next: promos => { this.allPromotions.set(promos); this.loadingPromotions.set(false); },
      error: () => this.loadingPromotions.set(false),
    });
  }

  setTab(tab: Tab): void { this.activeTab.set(tab); }

  isSelected(type: 'test' | 'profile' | 'promotion', id: string | number): boolean {
    return this.selectedItems().some(i => i.type === type && i.id === id);
  }

  toggle(type: 'test' | 'profile' | 'promotion', id: string | number, name: string, price?: string | number): void {
    const current = this.selectedItems();
    const idx = current.findIndex(i => i.type === type && i.id === id);
    if (idx > -1) {
      this.selectedItems.set(current.filter((_, i) => i !== idx));
    } else {
      this.selectedItems.set([...current, { type, id, name, price }]);
    }
  }

  removeItem(item: SelectedItem): void {
    this.selectedItems.set(this.selectedItems().filter(i => !(i.type === item.type && i.id === item.id)));
  }

  onSearch(tab: Tab, value: string): void {
    if (tab === 'tests') this.testSearch.set(value);
    else if (tab === 'profiles') this.profileSearch.set(value);
    else this.promotionSearch.set(value);
  }

  submit(): void {
    const id = this.orderId();
    if (!id || this.selectedItems().length === 0) return;

    this.submitting.set(true);
    this.error.set(null);

    const tests = this.selectedItems().map(item => {
      if (item.type === 'test') return { testDefinitionId: String(item.id) };
      if (item.type === 'profile') return { testProfileId: String(item.id) };
      return { promotionId: Number(item.id) };
    });

    this.orderService.addTestsToOrder(id, { tests }).subscribe({
      next: () => {
        this.success.set(true);
        this.submitting.set(false);
        setTimeout(() => this.router.navigate(['/laboratory-orders', id]), 1500);
      },
      error: (err: Error) => {
        this.error.set(err.message);
        this.submitting.set(false);
      },
    });
  }

  goBack(): void { this.router.navigate(['/laboratory-orders', this.orderId()]); }
}
