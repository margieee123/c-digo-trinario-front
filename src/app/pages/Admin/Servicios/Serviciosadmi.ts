import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

/* ── Types ─────────────────────────────────────────────── */

type ServiceCategory = 'masajes' | 'faciales' | 'corporales' | 'rituales';
type SortKey = 'recent' | 'price-high' | 'price-low' | 'duration';
type ToastType = 'success' | 'error' | 'info';

interface Service {
  id: string;
  name: string;
  category: ServiceCategory;
  price: number;
  duration: number;
  benefit: string;
  benefitIcon: string;
  imageUrl: string;
  description: string;
  active: boolean;
  createdAt: number;
}

interface Toast {
  id: string;
  message: string;
  type: ToastType;
  icon: string;
}

interface ServiceForm {
  name: string;
  category: ServiceCategory | '';
  price: number | null;
  duration: number | null;
  benefit: string;
  benefitIcon: string;
  imageUrl: string;
  description: string;
  active: boolean;
}

/* ── Seed Data ──────────────────────────────────────────── */

const SEED_SERVICES: Service[] = [
  {
    id: 'svc-001',
    name: 'Masaje con Piedras Obsidianas',
    category: 'masajes',
    price: 180,
    duration: 90,
    benefit: 'INTENSIDAD MEDIA',
    benefitIcon: 'auto_awesome',
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBeJszMhjqrd_0dUDsYtJ-nt5gLeKyjzcpj-8yuelBiXRVRSBR7ZUT5_mgfneDb91MVcqHe4EP4KJhyiN-DfzdZ2vJhbosXGGsnwQrq6rBOLLeHS9O8wXNRJO9RopKnJ6Lxyvsgf353OO97QA2c8CA4dRivdPSJaK0sLtvuO6W_1hop5553eFYCIKMZhE1FReAsZcQ0QeVLzkHj0Z6sn_ntvhXTwaiUrDIKtDwy1VGJieI158XolHlOw29c1dn532vHpalyCABPdmU',
    description: 'Ritual ancestral con piedras volcánicas de obsidiana calentadas a temperatura perfecta para liberar tensiones profundas.',
    active: true,
    createdAt: Date.now() - 86400000 * 4,
  },
  {
    id: 'svc-002',
    name: 'Facial de Polvo de Oro',
    category: 'faciales',
    price: 240,
    duration: 60,
    benefit: 'REJUVENECIMIENTO',
    benefitIcon: 'spa',
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCFC9E33s_dN7gXc0pZ9PRinjXmHt1HNUria-dCIWbG9sDTIi0c2NMdZm1ARLWRScuN3k0x412C2qCNPhsmIZN4pG4sixH-Bu7ACMBuAwxT6x6o6AlbOu1-Yk49eV9igPGRzkIMic3ogzVqMwhT3eyF57wg1AXBqLFCNMt0t9mxGZDi_doE4UG8e2ZL3oUCBP9c9PMYlZW6UWS-xXvmd_LLW9aB8AZoAM2Ab_R9pjjudCeprtvvbWXLqHY8t3KgJcu8e8HiNKICGaA',
    description: 'Tratamiento con partículas de oro de 24 quilates que estimulan la producción de colágeno y devuelven luminosidad al rostro.',
    active: true,
    createdAt: Date.now() - 86400000 * 3,
  },
  {
    id: 'svc-003',
    name: 'Exfoliación Sal del Himalaya',
    category: 'corporales',
    price: 150,
    duration: 45,
    benefit: 'DETOX',
    benefitIcon: 'water_drop',
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBA_1UmfcBv6cVtPcIvOhpFfQJ6mSVDpStKE4d2OWdkeIMGcvR9zD2VHJoVtx2jYkFSw7hd0Febk3AV3nG99Wks8bqk5-GVycOZqHZvgmd_4UFQF_Q2SQY34ZXDKY5I38cUzA-oIBnGZfU6FahpSUEdFBn7BP6VuyK-SxtIIRFwH5HFQfa5Q3s6PSNpfynAevbtaCrwzkqyitXKZMq12du_TXnKRNuxT8kod13UIHhVh4eQTp6BQ7rnJy-eyMd-ZsMmSIoAQxJIqMc',
    description: 'Purificación con cristales de sal rosa que eliminan impurezas, mejoran la circulación y dejan la piel renovada.',
    active: true,
    createdAt: Date.now() - 86400000 * 2,
  },
  {
    id: 'svc-004',
    name: 'Ritual Zen de Aromaterapia',
    category: 'rituales',
    price: 195,
    duration: 120,
    benefit: 'RELAJACIÓN TOTAL',
    benefitIcon: 'psychology',
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDj-LdjF8HyGWfLbIuBj50E-3SBfP2IMjZ0KXJzOls-dTfU1SVlePh4jdmghcWQk2zmH4KUJwgut-r9KBYtlJ_Kd8-W-8RX4WdFp94zNT-sNSt3_NcvvsyCle7sqNOyIWSP7XVVrkgStph4GNvBildyDeL9NL_lEiaHkHtaZaZQljF5Smlr220rxznmDoQAWKX2vZroVtKxYI5UfvGeAsIhzujFCgWpLI9Bu3-himlhPXoDoNg7zHzA2W8NHuXOepOZyuHLc0QTRtM',
    description: 'Inmersión sensorial completa con aceites esenciales de élite y técnicas orientales que llevan al estado de serenidad absoluta.',
    active: true,
    createdAt: Date.now() - 86400000,
  },
];

/* ── Component ──────────────────────────────────────────── */

@Component({
  selector: 'app-serviciosadmi',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './serviciosadmi.html',
  styleUrls: ['./serviciosadmi.css'],
})
export class Serviciosadmi implements OnInit {

  /* ─ Data ─ */
  services: Service[] = [...SEED_SERVICES];

  /* ─ Filters & pagination ─ */
  activeFilter: string   = 'all';
  sortKey: SortKey       = 'recent';
  currentPage: number    = 0;
  readonly itemsPerPage  = 6;

  readonly categories = [
    { value: 'all',        label: 'Todos'      },
    { value: 'masajes',    label: 'Masajes'    },
    { value: 'faciales',   label: 'Faciales'   },
    { value: 'corporales', label: 'Corporales' },
    { value: 'rituales',   label: 'Rituales'   },
  ];

  /* ─ Modal state ─ */
  showServiceModal  = false;
  showConfirmModal  = false;
  isEditing         = false;
  editingId: string | null = null;
  deletingId: string | null = null;
  deletingName      = '';

  /* ─ Form model ─ */
  form: ServiceForm = this.emptyForm();

  /* ─ Toasts ─ */
  toasts: Toast[] = [];

  /* ─ Placeholder image ─ */
  readonly placeholder = 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=600&q=80';

  /* ══════════════════════════════════════
     LIFECYCLE
  ══════════════════════════════════════ */

  ngOnInit(): void {}

  /* ══════════════════════════════════════
     COMPUTED GETTERS
  ══════════════════════════════════════ */

  get filteredSorted(): Service[] {
    let list = [...this.services];

    if (this.activeFilter !== 'all') {
      list = list.filter(s => s.category === this.activeFilter);
    }

    switch (this.sortKey) {
      case 'price-high': list.sort((a, b) => b.price - a.price);           break;
      case 'price-low':  list.sort((a, b) => a.price - b.price);           break;
      case 'duration':   list.sort((a, b) => b.duration - a.duration);     break;
      default:           list.sort((a, b) => b.createdAt - a.createdAt);   break;
    }

    return list;
  }

  get pageItems(): Service[] {
    const start = this.currentPage * this.itemsPerPage;
    return this.filteredSorted.slice(start, start + this.itemsPerPage);
  }

  get totalPages(): number {
    return Math.max(1, Math.ceil(this.filteredSorted.length / this.itemsPerPage));
  }

  get totalCount(): number {
    return this.filteredSorted.length;
  }

  get showingCount(): number {
    return this.pageItems.length;
  }

  get pageArray(): number[] {
    return Array.from({ length: this.totalPages }, (_, i) => i);
  }

  /* ══════════════════════════════════════
     FILTERS & SORT
  ══════════════════════════════════════ */

  setFilter(value: string): void {
    this.activeFilter = value;
    this.currentPage  = 0;
  }

  setSort(value: string): void {
    this.sortKey     = value as SortKey;
    this.currentPage = 0;
  }

  /* ══════════════════════════════════════
     PAGINATION
  ══════════════════════════════════════ */

  goToPage(page: number): void {
    this.currentPage = page;
  }

  prevPage(): void {
    if (this.currentPage > 0) this.currentPage--;
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages - 1) this.currentPage++;
  }

  /* ══════════════════════════════════════
     MODAL — ADD / EDIT
  ══════════════════════════════════════ */

  openAddModal(): void {
    this.isEditing        = false;
    this.editingId        = null;
    this.form             = this.emptyForm();
    this.showServiceModal = true;
    document.body.style.overflow = 'hidden';
  }

  openEditModal(svc: Service): void {
    this.isEditing  = true;
    this.editingId  = svc.id;
    this.form = {
      name:         svc.name,
      category:     svc.category,
      price:        svc.price,
      duration:     svc.duration,
      benefit:      svc.benefit,
      benefitIcon:  svc.benefitIcon,
      imageUrl:     svc.imageUrl,
      description:  svc.description,
      active:       svc.active,
    };
    this.showServiceModal = true;
    document.body.style.overflow = 'hidden';
  }

  closeServiceModal(): void {
    this.showServiceModal        = false;
    document.body.style.overflow = '';
  }

  /* ══════════════════════════════════════
     FORM SUBMIT
  ══════════════════════════════════════ */

  submitForm(): void {
    if (!this.validateForm()) {
      this.showToast('Por favor complete los campos requeridos', 'error');
      return;
    }

    const payload = {
      name:        this.form.name.trim(),
      category:    this.form.category as ServiceCategory,
      price:       this.form.price!,
      duration:    this.form.duration!,
      benefit:     this.form.benefit.trim().toUpperCase(),
      benefitIcon: this.form.benefitIcon.trim() || 'spa',
      description: this.form.description.trim(),
      imageUrl:    this.form.imageUrl.trim(),
      active:      this.form.active,
    };

    if (this.isEditing && this.editingId) {
      const idx = this.services.findIndex(s => s.id === this.editingId);
      if (idx !== -1) {
        this.services[idx] = { ...this.services[idx], ...payload };
        this.showToast('Servicio actualizado correctamente', 'success');
      }
    } else {
      this.services.unshift({
        ...payload,
        id:        this.generateId(),
        createdAt: Date.now(),
      });
      this.currentPage = 0;
      this.showToast('Servicio creado exitosamente', 'success');
    }

    // force Angular change detection on array mutation
    this.services = [...this.services];
    this.closeServiceModal();
  }

  /* ══════════════════════════════════════
     DELETE
  ══════════════════════════════════════ */

  openConfirmDelete(svc: Service): void {
    this.deletingId   = svc.id;
    this.deletingName = svc.name;
    this.showConfirmModal = true;
    document.body.style.overflow = 'hidden';
  }

  closeConfirmModal(): void {
    this.showConfirmModal        = false;
    document.body.style.overflow = '';
  }

  confirmDelete(): void {
    if (!this.deletingId) return;
    const name = this.deletingName;
    this.services  = this.services.filter(s => s.id !== this.deletingId);
    if (this.currentPage >= this.totalPages) {
      this.currentPage = Math.max(0, this.totalPages - 1);
    }
    this.showToast(`"${name}" eliminado`, 'error');
    this.deletingId = null;
    this.closeConfirmModal();
  }

  /* ══════════════════════════════════════
     IMAGE ERROR FALLBACK
  ══════════════════════════════════════ */

  onImgError(event: Event): void {
    (event.target as HTMLImageElement).src = this.placeholder;
  }

  /* ══════════════════════════════════════
     TOASTS
  ══════════════════════════════════════ */

  showToast(message: string, type: ToastType = 'info'): void {
    const icons: Record<ToastType, string> = {
      success: 'check_circle',
      error:   'error',
      info:    'info',
    };
    const toast: Toast = { id: this.generateId(), message, type, icon: icons[type] };
    this.toasts.push(toast);
    setTimeout(() => {
      this.toasts = this.toasts.filter(t => t.id !== toast.id);
    }, 3000);
  }

  trackToast(_: number, t: Toast): string { return t.id; }
  trackService(_: number, s: Service): string { return s.id; }

  /* ══════════════════════════════════════
     HELPERS
  ══════════════════════════════════════ */

  private emptyForm(): ServiceForm {
    return {
      name: '', category: '', price: null,
      duration: null, benefit: '', benefitIcon: '',
      imageUrl: '', description: '', active: true,
    };
  }

  private validateForm(): boolean {
    return !!(
      this.form.name.trim() &&
      this.form.category &&
      this.form.price !== null && this.form.price >= 0 &&
      this.form.duration !== null && this.form.duration > 0
    );
  }

  private generateId(): string {
    return 'svc-' + Math.random().toString(36).slice(2, 9);
  }

  capitalize(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }
}