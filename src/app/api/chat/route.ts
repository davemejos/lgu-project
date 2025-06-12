import { NextRequest, NextResponse } from 'next/server';
import { model, generationConfig, safetySettings } from '@/lib/gemini';
import { CHATBOT_SYSTEM_PROMPT } from '@/lib/chatbot-rules';

export async function POST(request: NextRequest) {
  try {
    // Parse the request body
    const { message, conversationHistory = [] } = await request.json();

    // Validate input
    if (!message || typeof message !== 'string') {
      return NextResponse.json(
        { success: false, error: 'Message is required and must be a string' },
        { status: 400 }
      );
    }

    // Prepare the conversation context
    interface ChatMessage {
      role: string;
      content: string;
    }

    const chatHistory = conversationHistory.map((msg: ChatMessage) => ({
      role: msg.role === 'user' ? 'user' : 'model',
      parts: [{ text: msg.content }],
    }));

    // Start a chat session with history
    const chat = model.startChat({
      generationConfig,
      safetySettings,
      history: [
        {
          role: 'user',
          parts: [{ text: CHATBOT_SYSTEM_PROMPT }],
        },
        {
          role: 'model',
          parts: [{ text: 'I understand. I will follow these guidelines and provide helpful, professional, and friendly assistance to users of the LGU system. I\'m ready to help!' }],
        },
        ...chatHistory,
      ],
    });

    // Send the message and get response
    const result = await chat.sendMessage(message);
    const response = await result.response;
    const responseText = response.text();

    // Return successful response
    return NextResponse.json({
      success: true,
      message: responseText,
    });

  } catch (error) {
    console.error('Chat API Error:', error);

    // Handle specific error types
    if (error instanceof Error) {
      // Model not found or API version issues
      if (error.message.includes('not found') || error.message.includes('404')) {
        return NextResponse.json(
          { success: false, error: 'AI model temporarily unavailable. Please try again later.' },
          { status: 503 }
        );
      }

      // Rate limiting or quota exceeded
      if (error.message.includes('quota') || error.message.includes('rate') || error.message.includes('429')) {
        return NextResponse.json(
          { success: false, error: 'Service temporarily unavailable due to high demand. Please try again later.' },
          { status: 429 }
        );
      }

      // Safety filter triggered
      if (error.message.includes('safety') || error.message.includes('blocked')) {
        return NextResponse.json(
          { success: false, error: 'I cannot provide a response to that request. Please try rephrasing your question.' },
          { status: 400 }
        );
      }

      // API key issues
      if (error.message.includes('API key') || error.message.includes('authentication') || error.message.includes('401')) {
        return NextResponse.json(
          { success: false, error: 'Authentication error. Please contact support.' },
          { status: 401 }
        );
      }
    }

    // Generic error response
    return NextResponse.json(
      { success: false, error: 'I apologize, but I\'m experiencing technical difficulties. Please try again in a moment.' },
      { status: 500 }
    );
  }
}

// Handle unsupported methods
export async function GET() {
  return NextResponse.json(
    { success: false, error: 'Method not allowed' },
    { status: 405 }
  );
}
