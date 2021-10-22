import React, { useEffect, useState } from 'react';
import { ScrollView } from 'react-native';
import { api } from '../../services/api';
import { IMessage, Message } from '../Message';
import { styles } from './styles';
import { io } from 'socket.io-client';

const messageQueue: IMessage[] = [];
const socket = io(String(api.defaults.baseURL));
socket.on('new_message', (message: IMessage) => messageQueue.push(message));

export function MessageList() {
  const [currentMessages, setCurrentMessages] = useState<IMessage[]>([]);

  useEffect(() => {
    async function getMessages() {
      const messages = await api.get<IMessage[]>('/messages/last_three');
      setCurrentMessages(messages.data);
    }

    getMessages();
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      if (messageQueue.length > 0) {
        setCurrentMessages(prevState => [messageQueue[0], prevState[0], prevState[1]]);
        messageQueue.shift();
      }
    }, 3000);

    return () => clearInterval(timer);
  }, []);

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="never"
    >
      {currentMessages.map(message => (
        <Message key={message.id} data={message} />
      ))}
    </ScrollView>
  );
}
