-- Seed pre-generated story for Rencontre Sportive (Phase 3 demo)
-- Run this AFTER 20260511000000_add_story_to_horses.sql

UPDATE horses
SET
  story_title = 'A Spring in Chantilly',
  story_text = 'パリ郊外、シャンティイの森に近い厩舎で、Rencontre Sportiveは朝の光を浴びていた。栗毛の毛並みが朝露に光り、まだ若い3歳の彼の瞳には、レースへの静かな闘志が宿っていた。

清水調教師は、毎朝彼の調子を見て微笑む。「今日も元気だな」――その言葉が、Rencontre Sportiveにとって何より大切な合図だった。彼は誰よりも人を理解する馬だった。日々の調教で見せる柔らかな反応、ゲートを出る瞬間の集中、走り終えた後の穏やかな呼吸。

馬主の米本氏は、海を越えた日本から、毎日のように動画と写真を見守っている。日本とフランスを結ぶこの小さな共有が、Rencontre Sportiveという一頭の馬の人生を、特別なものにしていた。

春のシャンティイ。芝の上を駆ける彼の姿は、まるで風そのもののようだった。デビュー前の彼は、まだ何者でもない。けれど、彼の物語は、確かに今、始まろうとしている。

これは、Rencontre Sportive ―― 出会いと、競い合いと、そして人と馬の絆の物語。',
  story_generated_at = NOW()
WHERE name = 'Rencontre Sportive';
