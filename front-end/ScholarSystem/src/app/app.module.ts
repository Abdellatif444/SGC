import { NgModule } from '@angular/core';
import { PublicationListComponent } from './components/publication-list/publication-list.component';
import { PublicationFormComponent } from './components/publication-form/publication-form.component';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { library } from '@fortawesome/fontawesome-svg-core';
import { faSignInAlt, faUserPlus } from '@fortawesome/free-solid-svg-icons';

library.add(faSignInAlt, faUserPlus);
@NgModule({
  declarations: [
    PublicationListComponent,
    PublicationFormComponent
  ],
})
export class AppModule { } 