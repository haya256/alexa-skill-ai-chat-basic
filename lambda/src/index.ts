import * as Alexa from "ask-sdk-core";
import OpenAI from "openai";

// OpenAI互換クライアント（環境変数で設定）
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY ?? "",
  baseURL: process.env.OPENAI_BASE_URL, // 未設定の場合はOpenAI公式を使用
});

const MODEL_NAME = process.env.MODEL_NAME ?? "gpt-oss-120b";

async function chat(userMessage: string): Promise<string> {
  const response = await openai.chat.completions.create({
    model: MODEL_NAME,
    messages: [
      {
        role: "system",
        content:
          "あなたは親切なAIアシスタントです。Alexaを通じてユーザーと会話しています。返答は簡潔にしてください。",
      },
      {
        role: "user",
        content: userMessage,
      },
    ],
    max_tokens: 300,
  });

  return response.choices[0]?.message?.content ?? "申し訳ありません、応答を取得できませんでした。";
}

const HOW_TO_ASK = "「質問があります」に続けて質問してください。例えば、「質問があります 富士山の高さは」のように話しかけてください。";

// スキル起動時のハンドラー
const LaunchRequestHandler: Alexa.RequestHandler = {
  canHandle(handlerInput) {
    return (
      Alexa.getRequestType(handlerInput.requestEnvelope) === "LaunchRequest"
    );
  },
  handle(handlerInput) {
    const speakOutput = "AIチャットへようこそ。" + HOW_TO_ASK;
    return handlerInput.responseBuilder
      .speak(speakOutput)
      .reprompt(HOW_TO_ASK)
      .getResponse();
  },
};

// チャットインテントのハンドラー
const ChatIntentHandler: Alexa.RequestHandler = {
  canHandle(handlerInput) {
    return (
      Alexa.getRequestType(handlerInput.requestEnvelope) === "IntentRequest" &&
      Alexa.getIntentName(handlerInput.requestEnvelope) === "ChatIntent"
    );
  },
  async handle(handlerInput) {
    const userMessage =
      Alexa.getSlotValue(handlerInput.requestEnvelope, "message") ?? "";

    if (!userMessage) {
      return handlerInput.responseBuilder
        .speak("うまく聞き取れませんでした。もう一度お願いします。")
        .reprompt("何か質問はありますか？")
        .getResponse();
    }

    try {
      const aiResponse = await chat(userMessage);
      return handlerInput.responseBuilder
        .speak(aiResponse)
        .reprompt("他に何かありますか？")
        .getResponse();
    } catch (error) {
      console.error("AI API error:", error);
      return handlerInput.responseBuilder
        .speak("申し訳ありません、エラーが発生しました。もう一度お試しください。")
        .reprompt("何か質問はありますか？")
        .getResponse();
    }
  },
};

// ヘルプインテントのハンドラー
const HelpIntentHandler: Alexa.RequestHandler = {
  canHandle(handlerInput) {
    return (
      Alexa.getRequestType(handlerInput.requestEnvelope) === "IntentRequest" &&
      Alexa.getIntentName(handlerInput.requestEnvelope) === "AMAZON.HelpIntent"
    );
  },
  handle(handlerInput) {
    return handlerInput.responseBuilder
      .speak(HOW_TO_ASK)
      .reprompt(HOW_TO_ASK)
      .getResponse();
  },
};

// フォールバックインテントのハンドラー（認識できなかった発話）
const FallbackIntentHandler: Alexa.RequestHandler = {
  canHandle(handlerInput) {
    return (
      Alexa.getRequestType(handlerInput.requestEnvelope) === "IntentRequest" &&
      Alexa.getIntentName(handlerInput.requestEnvelope) === "AMAZON.FallbackIntent"
    );
  },
  handle(handlerInput) {
    return handlerInput.responseBuilder
      .speak("うまく聞き取れませんでした。" + HOW_TO_ASK)
      .reprompt(HOW_TO_ASK)
      .getResponse();
  },
};

// キャンセル・停止インテントのハンドラー
const CancelAndStopIntentHandler: Alexa.RequestHandler = {
  canHandle(handlerInput) {
    return (
      Alexa.getRequestType(handlerInput.requestEnvelope) === "IntentRequest" &&
      (Alexa.getIntentName(handlerInput.requestEnvelope) ===
        "AMAZON.CancelIntent" ||
        Alexa.getIntentName(handlerInput.requestEnvelope) ===
          "AMAZON.StopIntent")
    );
  },
  handle(handlerInput) {
    return handlerInput.responseBuilder
      .speak("またいつでも話しかけてください。さようなら。")
      .getResponse();
  },
};

// セッション終了ハンドラー
const SessionEndedRequestHandler: Alexa.RequestHandler = {
  canHandle(handlerInput) {
    return (
      Alexa.getRequestType(handlerInput.requestEnvelope) ===
      "SessionEndedRequest"
    );
  },
  handle(handlerInput) {
    console.log(
      "Session ended:",
      JSON.stringify(handlerInput.requestEnvelope, null, 2)
    );
    return handlerInput.responseBuilder.getResponse();
  },
};

// エラーハンドラー
const ErrorHandler: Alexa.ErrorHandler = {
  canHandle() {
    return true;
  },
  handle(handlerInput, error) {
    console.error("Error handled:", error.message);
    return handlerInput.responseBuilder
      .speak("申し訳ありません、エラーが発生しました。")
      .reprompt("もう一度お試しください。")
      .getResponse();
  },
};

const skill = Alexa.SkillBuilders.custom()
  .addRequestHandlers(
    LaunchRequestHandler,
    ChatIntentHandler,
    HelpIntentHandler,
    FallbackIntentHandler,
    CancelAndStopIntentHandler,
    SessionEndedRequestHandler
  )
  .addErrorHandlers(ErrorHandler)
  .create();

// Lambdaハンドラーのエクスポート
// Node.js 24以降のLambdaはコールバック形式（.lambda()）に対応しないため、async関数で返す
export const handler = async (
  event: Parameters<typeof skill.invoke>[0],
  context?: unknown
) => skill.invoke(event, context);
