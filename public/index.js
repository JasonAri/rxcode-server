const formNode = document.getElementById('form')
const vxidInput = document.getElementById('vxid-input')
const formSpanNode = document.getElementById('form-span')
const formSubmit = document.getElementById('form-submit')
const rxCodeSpan = document.getElementById('rxcode-span')

const printBtn = document.getElementById('print-btn')
const printArea = document.getElementById('print-area')

// 打印按钮
printBtn.onclick = function (e) {
  // 清空旧打印
  printArea.innerHTML=''

  // 发请求
  axios.get('/api/admin').then(res => {
    const resultData = res.data.data
    const ulNode = document.createElement('UL')
    for (let i = 0; i < resultData.length; i++) {
      let item = resultData[i]
      const liNode = document.createElement('LI')
      liNode.innerText = `微信ID：${item.vxid}，兑换码：${item.rxCode}， 领取时间：${item.takenTime}`
      ulNode.appendChild(liNode)
    }

    printArea.appendChild(ulNode)
  })
}

// 提交按钮
formSubmit.onclick = function (e) {
  e.preventDefault()
  //   console.log(e)

  const vxid = vxidInput.value

  // 输入非空判断
  if (vxid) {
    // 判断是否领取过
    if (localStorage.getItem('userinfo')) {
      // 提示已领取
      formSpanNode.innerText = '您已经领取过兑换码了，欢迎下次参与'
      // 判断验证码节点是否为空
      if (!rxCodeSpan.innerText) {
        // 取出本地缓存
        const userInfo = JSON.parse(localStorage.getItem('userinfo'))
        // 设置页面rxCode
        rxCodeSpan.innerText = userInfo.rxCode
      }
      return
    }

    console.log('发axios请求...')
    axios
      .post('/api/rxcode', { vxid })
      .then(res => {
        // 解构兑换码
        const { rxCode } = res.data.data
        // 非空panduan
        if (rxCode) {
          // 清空提示
          formSpanNode.innerText = ''
          // 更新兑换码
          rxCodeSpan.innerText = rxCode
          // 本地缓存
          const userInfo = { vxid: vxid, rxCode: rxCode }
          localStorage.setItem('userinfo', JSON.stringify(userInfo))
        } else {
          // axios返回空值
          // 清空兑换码
          rxCodeSpan.innerText = ''
          // 提示输入错误
          formSpanNode.innerText = '微信ID错误，请重新输入'
        }
      })
      .catch(err => {
        console.log(err)
      })
    vxidInput.value = ''
  } else {
    // 输入为空提示
    formSpanNode.innerText = '输入不能为空'
  }
}
