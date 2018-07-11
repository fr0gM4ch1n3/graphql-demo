import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs';
import { QueryRef, Apollo } from 'apollo-angular';
import gql from 'graphql-tag';
import { map } from 'rxjs/operators';

@Component({
  selector: 'app-channel',
  templateUrl: './channel.component.html',
  styleUrls: ['./channel.component.css']
})
export class ChannelComponent implements OnInit {
  public id: string;
  public messages: Observable<any[]>;
  public newMessageInput: string;

  private query: QueryRef<any, Record<string, any>>;

  constructor(private route: ActivatedRoute, private apollo: Apollo) {
    this.id = this.route.snapshot.paramMap.get('id');

    this.query = this.apollo
      .watchQuery<any>({
        query: gql`
          query ChannelQuery($channelId : ID!) {
            channel(id: $channelId) {
              id
              name
              messages {
                id
                text
              }
            }
          }
        `,
        variables: {
          channelId: this.id.toString()
        }
      });

    this.messages = this.query.valueChanges
      .pipe(
        map(result => {
          console.log(result);
          return result.data.channel.messages;
        })
      );
  }

  ngOnInit() {
    this.query.subscribeToMore({
      document: gql`
          subscription messageAdded($channelId: ID!){
            messageAdded(channelId: $channelId){
              id
              text
            }
          }
      `,
      variables: {
        channelId: this.id.toString(),
      },
      onError: (err) => {
        console.error(err);
      },
      updateQuery: (prev, { subscriptionData }) => {
        if (!subscriptionData.data) {
          return prev;
        }

        const newMessage = subscriptionData.data.messageAdded;

        return {
          ...prev,
          channel: {
            ...prev.channel,
            messages: [...prev.channel.messages, newMessage]
          }
        };
      }
    });
  }

  newMessage(event: any) {
    this.apollo.mutate({
      mutation: gql`
        mutation addMessage($message: MessageInput!) {
          addMessage(message: $message) {
            id
            text
          }
        }`,
      variables: {
        message: {
          channelId: this.id,
          text: event.target.value
        }
      },
      optimisticResponse: {
        addMessage: {
          text: event.target.value,
          id: Math.round(Math.random() * -1000000),
          __typename: 'Message',
        },
      },
      update: (store, { data: { addChannel } }) => {
        if (!addChannel) {
          return store;
        }

        this.newMessageInput = '';

        return {
          ...store,
          channel: {
            messages: [
              addChannel.commentAdded,
              ...(<any>store).channel.messages
            ]
          }
        };
      }
    }).subscribe();
  }

}
