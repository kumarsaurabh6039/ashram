import { Routes } from '@angular/router';
import { AboutPageComponent } from './sections/about';
import { AdminPageComponent } from './pages/admin/admin-page';
import { ContactPageComponent } from './pages/contact';
import { InitiativeDetailComponent } from './pages/initiative';
import { AghorvaniPageComponent, DetailComponent, GalleryPageComponent, HomeComponent, InitiativesPageComponent, NewsPageComponent, StubComponent } from './pages/pages';

const stub = (path: string, title: string, kind = 'stub') => ({ path, component: StubComponent, data: { title, kind } });

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'about', component: AboutPageComponent },
  { path: 'gallery', component: GalleryPageComponent },
  { path: 'news', component: NewsPageComponent },
  { path: 'news/:slug', component: DetailComponent },
  { path: 'initiatives', component: InitiativesPageComponent },
  { path: 'aghorvani', component: AghorvaniPageComponent },
  { path: 'contact', component: ContactPageComponent },
  stub('donation', 'Donation', 'donation'),
  { path: 'school', component: InitiativeDetailComponent, data: { slug: 'school' } },
  { path: 'hospital', component: InitiativeDetailComponent, data: { slug: 'hospital' } },
  { path: 'organic-farming', component: InitiativeDetailComponent, data: { slug: 'organic-farming' } },
  { path: 'admin', component: AdminPageComponent },
  { path: '**', redirectTo: '' },
];