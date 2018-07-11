import { Component, OnInit } from '@angular/core';
import { Apollo, QueryRef } from 'apollo-angular';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import gql from 'graphql-tag';

@Component({
  selector: 'app-channel-list',
  templateUrl: './channel-list.component.html',
  styleUrls: ['./channel-list.component.css']
})
export class ChannelListComponent implements OnInit {
  channels: Observable<any[]>;

  private query: QueryRef<any, Record<string, any>>;

  constructor(private apollo: Apollo) { }

  ngOnInit() {
    this.query = this.apollo
      .watchQuery<any>({
        query: gql`
          query ChannelsListQuery {
            channels {
              id
              name
            }
          }
        `
      });

    this.channels = this.query.valueChanges
      .pipe(
        map(result => {
          console.log(result);
          return result.data.channels;
        })
      );
  }

  newChannel(event: any) {
    this.apollo.mutate({
      mutation: gql`
        mutation addChannel($name: String!) {
          addChannel(name: $name) {
            id
            name
          }
        }`,
      variables: {
        id: Math.round(Math.random() * -1000000),
        name: event.target.value
      },
      update: (store, { data: { addChannel } }) => {
        if (!addChannel) {
          return store;
        }

        return {
          ...store,
          entry: {
            channels: [
              addChannel.commentAdded,
              ...(<any>store).entry.channels
            ]
          }
        };
      }
    }).subscribe();
  }
}

// https://www.apollographql.com/docs/angular/features/subscriptions.html
