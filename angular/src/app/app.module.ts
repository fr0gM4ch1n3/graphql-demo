import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClientModule, HttpClient } from '@angular/common/http';
import { ApolloModule, Apollo } from 'apollo-angular';
import { HttpLinkModule, HttpLink } from 'apollo-angular-link-http';
import { InMemoryCache } from 'apollo-cache-inmemory';
import { split } from 'apollo-link';

import { WebSocketLink } from 'apollo-link-ws';
import { getMainDefinition } from 'apollo-utilities';

import { AppComponent } from './app.component';
import { ChannelListComponent } from './channel-list/channel-list.component';
import { ChannelComponent } from './channel/channel.component';
import { AppRoutingModule } from './/app-routing.module';
import { NavbarComponent } from './navbar/navbar.component';

@NgModule({
  declarations: [
    AppComponent,
    ChannelListComponent,
    ChannelComponent,
    NavbarComponent
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    FormsModule,
    ApolloModule,
    HttpLinkModule,
    AppRoutingModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule {
  constructor(apollo: Apollo, httpClient: HttpClient) {


    const httpLink = new HttpLink(httpClient).create({
      uri: 'http://localhost:4000/graphql'
    });

    const subscriptionLink = new WebSocketLink({
      uri:
        'ws://localhost:4000/subscriptions',
      options: {
        reconnect: true,
        connectionParams: {
          authToken: localStorage.getItem('token') || null
        }
      }
    });

    const link = split(
      ({ query }) => {
        const def = getMainDefinition(query);
        console.log('@@@@@@@@@@@@', def);
        return def.kind === 'OperationDefinition' && def.operation === 'subscription';
      },
      subscriptionLink,
      httpLink
    );



    apollo.create({
      link,
      cache: new InMemoryCache()
    });



  }
}
