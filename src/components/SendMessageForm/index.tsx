import React, { useEffect, useState } from 'react';
import { Alert, Keyboard, TextInput, View } from 'react-native';
import { api } from '../../services/api';
import { COLORS } from '../../theme';
import { Button } from '../Button';
import { styles } from './styles';
import { io } from 'socket.io-client';

export function SendMessageForm() {
  const [message, setMessage] = useState('');
  const [isSendingMessage, setIsSendingMessage] = useState(false);

  const sendMessage = async () => {
    const formattedMessage = message.trim();

    if (formattedMessage.length > 0) {
      setIsSendingMessage(true);
      await api.post('/messages', { message: formattedMessage });

      setMessage('');
      Keyboard.dismiss();
      Alert.alert('Mensagem enviada com sucesso!');
      setIsSendingMessage(false);
    } else {
      Alert.alert('Digite a mensagem para enviar.');
    }
  };

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        multiline
        maxLength={140}
        placeholder="Qual a sua expectativa para o DoWhile 2021?"
        placeholderTextColor={COLORS.GRAY_PRIMARY}
        keyboardAppearance="dark"
        editable={!isSendingMessage}
        onChangeText={setMessage}
        value={message}
      />

      <Button
        title="ENVIAR MENSAGEM"
        backgroundColor={COLORS.PINK}
        color={COLORS.BLACK_PRIMARY}
        onPress={sendMessage}
        isLoading={isSendingMessage}
      />
    </View>
  );
}
