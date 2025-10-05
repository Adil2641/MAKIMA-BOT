module.exports = {
  config: {
    name: "nude",
    aliases: ["nangai"],
    version: "1.0",
    author: "M",
    countDown: 0,
    role: 2,
    shortDescription: "send you pic of nude",
    longDescription: "sends u pic of girls nude",
    category: "image",
    guide: "{pn}"
  },

  onStart: async function ({ message }) {
   var link = [ 
"https://i.postimg.cc/k4YWbh8Q/download.jpg",
"https://i.postimg.cc/ncSctfxR/78575087-030-c899.jpg",
"https://i.postimg.cc/RV25RS45/7a1157fcafe5fd201418c0ba25359e5e-28.jpg",
"https://i.postimg.cc/Ss1txdxg/vlcsnap-2023-02-08-23h06m07s000.jpg",
"https://i.postimg.cc/B6bMkFBM/images.jpg",
"https://i.postimg.cc/WbLxF9nT/download.jpg",
"https://i.postimg.cc/J7J2LNWx/images.jpg",
"https://i.postimg.cc/FRb3Ps2M/images.jpg",
"https://i.postimg.cc/J4zZq8KT/images.jpg",
"https://i.postimg.cc/hvPzp88P/images.jpg",
"https://i.postimg.cc/MpjcPpBM/images.jpg",
"https://i.postimg.cc/TwkY2zm1/15867170-730298-nude-japanese-woman-big-ass-880x660-880x660.jpg",
"https://i.postimg.cc/bwQySDkh/images.jpg",
"https://i.postimg.cc/65ZwF2Hx/images.jpg",
"https://i.postimg.cc/BQfQSBP5/download.jpg",
"https://i.postimg.cc/CMkSQnrd/download.jpg",
"https://i.postimg.cc/W4dP6dqQ/download.jpg",
"https://i.postimg.cc/9Fc5g8qN/images.jpg",
"https://i.postimg.cc/WzX9H7Qw/98507487-010-1602.jpg",
"https://i.postimg.cc/fLv5VKTX/images.jpg",
"https://i.postimg.cc/SNPdYjqD/images.jpg",
"https://i.postimg.cc/VkjtsNNs/download.jpg",
"https://i.postimg.cc/cHJtcMB7/download.jpg",
"https://i.postimg.cc/NGS21X9c/download.jpg",
"https://i.postimg.cc/G2Ntx0pZ/images.jpg",
"https://i.postimg.cc/JzWKM0Lx/images.jpg",
"https://i.postimg.cc/FHsdyXg4/58354537-099-63c5.jpg",
"https://i.postimg.cc/vTh8TDKz/download.jpg",
"https://i.postimg.cc/hGmSx2wv/download.jpg",
"https://i.postimg.cc/VvZy2tTh/images.jpg",
"https://i.postimg.cc/vTgXH6Dw/1.webp",
"https://i.postimg.cc/NG9W0K3K/images.jpg",
"https://i.postimg.cc/xCkFqZFG/images.jpg",
"https://i.postimg.cc/3xnL1hsV/1280x720-17241208.webp",
]
let img = link[Math.floor(Math.random()*link.length)]
message.send({
  body: '「 𝕊𝕦𝕘𝕒𝕣 𝕄𝕦𝕞𝕞𝕒 𝔸𝕙𝕙💦🥵 」',attachment: await global.utils.getStreamFromURL(img)
})
}
     }