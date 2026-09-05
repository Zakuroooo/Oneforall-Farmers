import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';

interface Message {
  id: string;
  sender: 'BUYER' | 'FARMER';
  text: string;
  time: string;
}

export function S27_BuyerChat() {
  const [messages, setMessages] = useState<Message[]>([
    { id: '1', sender: 'FARMER', text: 'नमस्कार व्यापारी साहेब, कांदा प्रत A दर्जाचा आहे.', time: '१०:३०' },
    { id: '2', sender: 'BUYER', text: 'होय, मी फोटो आणि ग्रेड पाहिली. १९६० दर मंजूर आहे का?', time: '१०:३२' },
  ]);
  const [input, setInput] = useState('');

  const handleSend = () => {
    if (!input.trim()) return;
    setMessages(prev => [
      ...prev,
      { id: String(Date.now()), sender: 'BUYER', text: input.trim(), time: 'आत्ताच' },
    ]);
    setInput('');
  };

  return (
    <View style={styles.container}>
      <Card style={styles.headerCard}>
        <Text style={styles.chatTitle}>शेतकरी: रामभाऊ पाटील (नाशिक)</Text>
        <Text style={styles.chatSub}>लॉट #LOT-401 · कांदा १०० क्विंटल</Text>
      </Card>

      <ScrollView style={styles.msgList} contentContainerStyle={styles.msgContent}>
        {messages.map(m => (
          <View
            key={m.id}
            style={[styles.bubble, m.sender === 'BUYER' ? styles.buyerBubble : styles.farmerBubble]}>
            <Text style={[styles.msgText, m.sender === 'BUYER' ? styles.buyerMsgText : styles.farmerMsgText]}>
              {m.text}
            </Text>
            <Text style={styles.timeText}>{m.time}</Text>
          </View>
        ))}
      </ScrollView>

      <View style={styles.inputBar}>
        <TextInput
          style={styles.textInput}
          value={input}
          onChangeText={setInput}
          placeholder="संदेश टाका..."
        />
        <Button title="पाठवा" onPress={handleSend} variant="primary" style={styles.sendBtn} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAF9' },
  headerCard: { margin: 16, padding: 14, borderRadius: 12 },
  chatTitle: { fontSize: 16, fontWeight: '700', color: '#1E293B' },
  chatSub: { fontSize: 13, color: '#64748B', marginTop: 2 },
  msgList: { flex: 1, paddingHorizontal: 16 },
  msgContent: { paddingBottom: 16 },
  bubble: { maxWidth: '80%', padding: 12, borderRadius: 12, marginBottom: 10 },
  buyerBubble: { alignSelf: 'flex-end', backgroundColor: '#1565C0' },
  farmerBubble: { alignSelf: 'flex-start', backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E2E8F0' },
  msgText: { fontSize: 15, lineHeight: 22 },
  buyerMsgText: { color: '#FFFFFF' },
  farmerMsgText: { color: '#1E293B' },
  timeText: { fontSize: 11, color: '#94A3B8', marginTop: 4, alignSelf: 'flex-end' },
  inputBar: { flexDirection: 'row', padding: 12, backgroundColor: '#FFFFFF', borderTopWidth: 1, borderTopColor: '#E2E8F0', gap: 8 },
  textInput: { flex: 1, borderWidth: 1, borderColor: '#CBD5E1', borderRadius: 10, paddingHorizontal: 12, fontSize: 16 },
  sendBtn: { minHeight: 48, paddingHorizontal: 16 },
});
