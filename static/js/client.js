// Client.js

import React, {Component} from 'react';
import { Widget, addResponseMessage, addUserMessage, dropMessages } from 'react-chat-widget';
import { CometChat } from '@cometchat-pro/chat';
import config from './config';
import 'react-chat-widget/lib/styles.css';

const agentUID = config.agentUID;
const CUSTOMER_MESSAGE_LISTENER_KEY = "client-listener";
const limit = 30;

class Client extends Component {
  componentDidMount() {
    addResponseMessage('Welcome to our store!');
    addResponseMessage('Are you looking for anything in particular?');
  }
 
  render() {
    return (
      <div className='App'>
        <Widget
          handleNewUserMessage={this.handleNewUserMessage}
          title='My E-commerce Live Chat'
          subtitle='Ready to help you'
        />
      </div>
    );
  }
  
  createUser = async () => {
    const response = await fetch(`/api/create`)
    const result = await response.json()
    return result;
  }
    
  handleNewUserMessage = newMessage => {
    console.log(`New message incoming! ${newMessage}`);
    var textMessage = new CometChat.TextMessage(
      agentUID,
      newMessage,
      CometChat.MESSAGE_TYPE.TEXT,
      CometChat.RECEIVER_TYPE.USER
    );
    let uid = localStorage.getItem("cc-uid");
    if (uid === null) {
    // no uid, create user
      this.createUser().then(
        result => {
          console.log('auth token fetched', result);
          localStorage.setItem("cc-uid",result.uid)
          // do login
          CometChat.login(result.authToken)
          .then(user => {
            console.log("Login successfully:", { user });
            CometChat.sendMessage(textMessage).then(
              message => {
                console.log('Message sent successfully:', message);
              },
              error => {
                console.log('Message sending failed with error:', error);
              }
            );
            // create listener
            CometChat.addMessageListener(
              CUSTOMER_MESSAGE_LISTENER_KEY,
              new CometChat.MessageListener({
                onTextMessageReceived: message => {
                  console.log("Incoming Message Log", { message });
                  addResponseMessage(message.text);
                }
              })
            );
          })
      },
      error => {
        console.log('Initialization failed with error:', error);
      })
    } else {
      // we have uid, do send
      CometChat.sendMessage(textMessage).then(
        message => {
          console.log('Message sent successfully:', message);
        },
        error => {
          console.log('Message sending failed with error:', error);
        }
      );
    }
  };
  componentWillUnmount() {
    CometChat.removeMessageListener(CUSTOMER_MESSAGE_LISTENER_KEY);
    CometChat.logout();
    dropMessages();
  }
}

export default Client;