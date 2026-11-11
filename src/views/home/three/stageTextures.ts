import * as THREE from 'three'

/**
 * 创建径向发光贴图（用于曝气气泡与流光粒子）
 */
export function createGlowTexture(colorHex = '#00e5ff'): THREE.CanvasTexture {
  const canvas = document.createElement('canvas')
  canvas.width = 64
  canvas.height = 64
  const ctx = canvas.getContext('2d')!
  const gradient = ctx.createRadialGradient(32, 32, 2, 32, 32, 30)
  gradient.addColorStop(0, '#ffffff')
  gradient.addColorStop(0.35, colorHex)
  gradient.addColorStop(1, 'rgba(0, 0, 0, 0)')
  ctx.fillStyle = gradient
  ctx.fillRect(0, 0, 64, 64)
  return new THREE.CanvasTexture(canvas)
}

/**
 * 创建波浪纹理贴图（用于大棚波纹顶板真实质感）
 */
export function createCorrugatedRoofTexture(baseColor: string, stripeColor: string): THREE.CanvasTexture {
  const canvas = document.createElement('canvas')
  canvas.width = 128
  canvas.height = 128
  const ctx = canvas.getContext('2d')!
  ctx.fillStyle = baseColor
  ctx.fillRect(0, 0, 128, 128)
  ctx.fillStyle = stripeColor
  for (let y = 0; y < 128; y += 8) {
    ctx.fillRect(0, y, 128, 3)
  }
  const tex = new THREE.CanvasTexture(canvas)
  tex.wrapS = THREE.RepeatWrapping
  tex.wrapT = THREE.RepeatWrapping
  tex.repeat.set(4, 6)
  return tex
}

/**
 * 创建地面路灯柔和光斑贴图（模拟参考图中道路及广场地面一排排暖白/冰蓝打光光晕）
 */
export function createLightPoolTexture(
  coreColor = 'rgba(255, 243, 214, 0.85)',
  midColor = 'rgba(255, 210, 140, 0.32)'
): THREE.CanvasTexture {
  const canvas = document.createElement('canvas')
  canvas.width = 128
  canvas.height = 128
  const ctx = canvas.getContext('2d')!
  const gradient = ctx.createRadialGradient(64, 64, 4, 64, 64, 62)
  gradient.addColorStop(0, coreColor)
  gradient.addColorStop(0.45, midColor)
  gradient.addColorStop(1, 'rgba(0, 0, 0, 0)')
  ctx.fillStyle = gradient
  ctx.fillRect(0, 0, 128, 128)
  return new THREE.CanvasTexture(canvas)
}

/**
 * 创建建筑暖光内透窗户渐变贴图（上暖亮、下柔和，带窗框百叶层次）
 */
export function createWarmWindowTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas')
  canvas.width = 128
  canvas.height = 128
  const ctx = canvas.getContext('2d')!

  const grad = ctx.createLinearGradient(0, 0, 0, 128)
  grad.addColorStop(0, '#fff3c4')
  grad.addColorStop(0.5, '#ffbe55')
  grad.addColorStop(1, '#d97706')
  ctx.fillStyle = grad
  ctx.fillRect(0, 0, 128, 128)

  // 内部微弱窗格暗线，增加内透真实感
  ctx.strokeStyle = 'rgba(69, 26, 3, 0.45)'
  ctx.lineWidth = 5
  ctx.strokeRect(2, 2, 124, 124)
  ctx.beginPath()
  ctx.moveTo(64, 0)
  ctx.lineTo(64, 128)
  ctx.moveTo(0, 68)
  ctx.lineTo(128, 68)
  ctx.stroke()

  return new THREE.CanvasTexture(canvas)
}

