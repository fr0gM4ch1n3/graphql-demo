import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { ChannelListComponent } from './channel-list/channel-list.component';
import { ChannelComponent } from './channel/channel.component';

const routes: Routes = [
  { path: '', redirectTo: '/channels', pathMatch: 'full' },
  { path: 'channels', component: ChannelListComponent },
  { path: 'channel/:id', component: ChannelComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
