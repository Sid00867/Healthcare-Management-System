import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Speech from 'expo-speech';
import Voice from '@react-native-voice/voice';
import axios from 'axios';

const VoiceAssistantScreen = () => {
    const [apiKey, setApiKey] = useState('OPENAIKEY');//OPEN AI KEY
    const [messages, setMessages] = useState([
        { id: 1, text: "Hello! I'm your health assistant. How can I help you today?", sender: 'assistant' }
    ]);
    const [inputMessage, setInputMessage] = useState('');
    const [isRecording, setIsRecording] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        // Set up voice recognition
        Voice.onSpeechStart = onSpeechStart;
        Voice.onSpeechEnd = onSpeechEnd;
        Voice.onSpeechResults = onSpeechResults;
        Voice.onSpeechError = onSpeechError;

        return () => {
            Voice.destroy().then(Voice.removeAllListeners);
        };
    }, []);

    const onSpeechStart = () => {
        console.log('Speech started');
    };

    const onSpeechEnd = () => {
        setIsRecording(false);
        console.log('Speech ended');
    };

    const onSpeechResults = (e) => {
        if (e.value && e.value[0]) {
            setInputMessage(e.value[0]);
            handleSend(e.value[0]);
        }
    };

    const onSpeechError = (e) => {
        console.error('Speech recognition error:', e);
        setIsRecording(false);
    };

    const startRecording = async () => {
        try {
            await Voice.start('en-US');
            setIsRecording(true);
        } catch (e) {
            console.error('Failed to start recording:', e);
        }
    };

    const stopRecording = async () => {
        try {
            await Voice.stop();
            setIsRecording(false);
        } catch (e) {
            console.error('Failed to stop recording:', e);
        }
    };

    const handleSend = async (text = inputMessage) => {
        if (!text.trim()) return;

        // Add user message
        const userMessage = { id: messages.length + 1, text, sender: 'user' };
        setMessages(prevMessages => [...prevMessages, userMessage]);
        setInputMessage('');
        setIsLoading(true);

        try {
            // Real OpenAI API call
            const response = await axios.post(
                'https://api.openai.com/v1/chat/completions',
                {
                    model: "gpt-3.5-turbo",
                    messages: [
                        {
                            role: "system",
                            content: "You are a helpful health assistant that provides concise advice. Keep responses brief and focused on health-related information. The user has a health app that tracks heart rate, blood oxygen, respiratory rate, skin temperature, blood pressure, activity calories, and sleep metrics."
                        },
                        ...messages.map(msg => ({
                            role: msg.sender === 'user' ? 'user' : 'assistant',
                            content: msg.text
                        })),
                        { role: "user", content: text }
                    ],
                    max_tokens: 150,
                    temperature: 0.7
                },
                {
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${apiKey}`
                    }
                }
            );

            // Extract the response
            const assistantResponse = response.data.choices[0].message.content;

            // Add assistant message
            const assistantMessage = {
                id: messages.length + 2,
                text: assistantResponse,
                sender: 'assistant'
            };

            setMessages(prevMessages => [...prevMessages, assistantMessage]);

            // Text-to-speech for assistant response
            Speech.speak(assistantResponse, { language: 'en', rate: 0.9 });

        } catch (error) {
            console.error('Error processing message:', error);
            const errorMessage = error.response?.data?.error?.message ||
                "Sorry, I couldn't process that request. Please try again.";

            setMessages(prevMessages => [
                ...prevMessages,
                { id: messages.length + 2, text: errorMessage, sender: 'assistant' }
            ]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <Text style={styles.header}>Voice Assistant</Text>

            <ScrollView
                style={styles.messagesContainer}
                contentContainerStyle={styles.messagesList}
            >
                {messages.map((message) => (
                    <View
                        key={message.id}
                        style={[
                            styles.messageBubble,
                            message.sender === 'user' ? styles.userBubble : styles.assistantBubble
                        ]}
                    >
                        <Text style={[
                            styles.messageText,
                            message.sender === 'user' ? styles.userText : styles.assistantText
                        ]}>
                            {message.text}
                        </Text>
                    </View>
                ))}
                {isLoading && (
                    <View style={styles.loadingContainer}>
                        <ActivityIndicator size="small" color="#6200ee" />
                    </View>
                )}
            </ScrollView>

            <View style={styles.inputContainer}>
                <TextInput
                    style={styles.input}
                    value={inputMessage}
                    onChangeText={setInputMessage}
                    placeholder="Type your message..."
                    placeholderTextColor="#aaa"
                    onSubmitEditing={() => handleSend()}
                />

                {inputMessage ? (
                    <TouchableOpacity style={styles.sendButton} onPress={() => handleSend()}>
                        <Ionicons name="send" size={24} color="white" />
                    </TouchableOpacity>
                ) : (
                    <TouchableOpacity
                        style={[styles.sendButton, isRecording && styles.recordingButton]}
                        onPress={isRecording ? stopRecording : startRecording}
                    >
                        <Ionicons name={isRecording ? "stop" : "mic"} size={24} color="white" />
                    </TouchableOpacity>
                )}
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    header: {
        fontSize: 24,
        fontWeight: 'bold',
        margin: 20
    },
    messagesContainer: {
        flex: 1,
        paddingHorizontal: 16,
    },
    messagesList: {
        paddingBottom: 16,
    },
    messageBubble: {
        maxWidth: '80%',
        padding: 12,
        borderRadius: 16,
        marginVertical: 8,
    },
    userBubble: {
        backgroundColor: '#6200ee',
        alignSelf: 'flex-end',
        borderBottomRightRadius: 4,
    },
    assistantBubble: {
        backgroundColor: 'white',
        alignSelf: 'flex-start',
        borderBottomLeftRadius: 4,
    },
    messageText: {
        fontSize: 16,
    },
    userText: {
        color: 'white',
    },
    assistantText: {
        color: '#2c3e50',
    },
    loadingContainer: {
        alignItems: 'center',
        marginVertical: 8,
    },
    inputContainer: {
        flexDirection: 'row',
        padding: 16,
        backgroundColor: 'white',
        borderTopWidth: 1,
        borderTopColor: '#e0e0e0',
    },
    input: {
        flex: 1,
        backgroundColor: '#f0f0f0',
        borderRadius: 24,
        paddingHorizontal: 16,
        paddingVertical: 10,
        marginRight: 8,
        fontSize: 16,
    },
    sendButton: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: '#6200ee',
        justifyContent: 'center',
        alignItems: 'center',
    },
    recordingButton: {
        backgroundColor: '#e74c3c',
    },
});

export default VoiceAssistantScreen;
