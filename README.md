# svg_canvas_chart

SVGとCanvasの違いを知るために、TypeScriptを使って、ほぼ同じロジックでチャートを実装(現状ローソク足のみ)しました。
チャートのwidthやheight、バーの表示数、scale(canvasのみ devicePixelRatioが2以上の場合にセットすることで表示がぼやけないようにする)を設定できるので、パフォーマンスの変化を比較できるようになっています。
チャート内でdragすることによりスクロールができるので表示のなめらかさを確認できます。
チャートの表示にかかった時間をelapse timeとして表示されます。
pinch in pinch outにより、チャート内におけるバーの表示数を手軽に変更できます。

# 実行

```
git clone https://github.com/takeshy/svg_canvas_chart
cd svg_canvas_chart

# 実行マシン以外からアクセスする場合
# スマホ等のブラウザからhttp://ローカルIPアドレス:8000/distにアクセス
npm run build
python -m SimpleHTTPServer

# 実行マシンのみでアクセスする場合(localhost限定)
# ブラウザからhttp://localhost:8080/distにアクセス
npm run dev_server
```

# DEMO

https://takeshy.github.io/svg_canvas_chart/dist/
