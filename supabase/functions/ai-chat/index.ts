Deno.serve(async (req) => {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
  };

  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const { message, userProfile } = await req.json();

    // 构建系统提示词
    const systemPrompt = `你是MiniPlus营养健康助手，一个专业的家庭营养顾问。
用户信息：${userProfile ? `身高${userProfile.height || '未知'}cm，体重${userProfile.weight || '未知'}kg，每日热量目标${userProfile.daily_calorie_goal || 2000}kcal` : '未提供'}

你的职责：
1. 根据用户健康目标推荐食谱
2. 分析食物营养成分
3. 提供饮食建议
4. 回答营养相关问题

请用简洁友好的中文回复，必要时提供具体的食谱建议（包含食材和热量信息）。`;

    // 调用Gemini AI API
    const geminiApiKey = Deno.env.get('GEMINI_API_KEY');
    const geminiApiUrl = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';
    
    // 调试日志
    console.log('GEMINI_API_KEY exists:', !!geminiApiKey);
    console.log('API Key length:', geminiApiKey ? geminiApiKey.length : 0);
    console.log('API Key starts with:', geminiApiKey ? geminiApiKey.substring(0, 10) + '...' : 'NOT_FOUND');

    if (!geminiApiKey) {
      // 如果没有API密钥，返回智能默认响应
      const defaultResponses: Record<string, string> = {
        '今天吃什么': `根据您的需求，我推荐以下食谱：

**香煎鸡胸肉配藜麦沙拉**
- 热量：约380千卡
- 蛋白质：35g
- 准备时间：25分钟

**食材清单：**
- 鸡胸肉 200g
- 藜麦 50g
- 混合生菜 100g
- 小番茄 8颗
- 橄榄油 1汤匙

这道菜富含优质蛋白质，低脂健康，非常适合健身减脂人群。需要详细制作步骤吗？`,
        '低脂': `为您推荐低脂健康餐：

**清蒸鲈鱼配时蔬**
- 热量：约260千卡
- 脂肪：仅8g
- 蛋白质：28g

**蒜蓉西兰花虾仁**
- 热量：约220千卡
- 脂肪：6g
- 蛋白质：25g

低脂饮食的关键是选择蒸、煮、烤等烹饪方式，避免油炸。`,
        '增肌': `增肌期推荐高蛋白食谱：

**牛肉藜麦营养碗**
- 热量：约520千卡
- 蛋白质：42g
- 碳水：45g

建议每日蛋白质摄入量达到体重(kg)x1.6-2.2g，分3-4餐摄入。`,
      };

      let response = '您好！我是MiniPlus营养助手。我可以为您推荐食谱、分析食物营养、制定饮食计划。请告诉我您的需求，比如"今天吃什么"或"推荐低脂晚餐"。';
      
      for (const [key, value] of Object.entries(defaultResponses)) {
        if (message.includes(key)) {
          response = value;
          break;
        }
      }

      return new Response(JSON.stringify({ 
        message: response,
        source: 'default'
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // 有API密钥时调用真实Gemini AI
    const fullPrompt = `${systemPrompt}\n\n用户问题：${message}`;
    
    const aiResponse = await fetch(geminiApiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-goog-api-key': geminiApiKey,
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: fullPrompt
              }
            ]
          }
        ]
      }),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.log('Gemini API error response:', errorText);
      console.log('Response status:', aiResponse.status);
      console.log('Response statusText:', aiResponse.statusText);
      throw new Error(`Gemini API request failed: ${aiResponse.status} ${aiResponse.statusText} - ${errorText}`);
    }

    const aiData = await aiResponse.json();
    const assistantMessage = aiData.candidates?.[0]?.content?.parts?.[0]?.text || '抱歉，我暂时无法回答您的问题。';

    return new Response(JSON.stringify({ 
      message: assistantMessage,
      source: 'ai'
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    return new Response(JSON.stringify({ 
      error: error.message,
      message: '抱歉，服务暂时不可用，请稍后再试。'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
