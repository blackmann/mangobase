import { h } from 'vue'
import DefaultTheme from 'vitepress/theme'
import MangoSpline from './mango-spline.vue'
import './styles.css'

export default {
  extends: DefaultTheme,
  Layout() {
    return h(DefaultTheme.Layout, null, {
      'home-hero-image': () => h(MangoSpline)
    })
  }
}
