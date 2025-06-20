import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './components/home/home.component';
import { LoginComponent } from './components/login/login.component';
import { RegisterComponent } from './components/register/register.component';
import { PublishComponent } from './components/publish/publish.component';
import { ChatComponent } from './components/chat/chat.component';
import { PublicationListComponent } from './components/publication-list/publication-list.component';
import { PublicationFormComponent } from './components/publication-form/publication-form.component';
import { ProfileComponent } from './components/profile/profile.component';
import { ExploreDocumentsComponent } from './components/explore-documents/explore-documents.component';



export const routes: Routes = [
  { 
    path: '', 
    component: HomeComponent
  },
  { 
    path: 'login', 
    component: LoginComponent
  },
  { 
    path: 'register', 
    component: RegisterComponent
  },
  
  
  { 
    path: 'chat', 
    component: ChatComponent 
  },
  { 
    path: 'publish', 
    component: PublishComponent 
  },
  { 
    path: 'filtrage', 
    component: PublicationListComponent 
  },
  { 
    path: 'publications', 
    component: PublicationListComponent 
  },
  { 
    path: 'profile', 
    component: ProfileComponent 
  },
  { 
    path: 'explore', 
    component: ExploreDocumentsComponent 
  },
  { 
    path: '**', 
    redirectTo: '' 
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}