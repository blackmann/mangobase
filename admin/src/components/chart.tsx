import {
  BarController,
  BarElement,
  CategoryScale,
  Chart,
  LinearScale,
} from 'chart.js'
import React from 'preact/compat'

Chart.register(BarController, BarElement, CategoryScale, LinearScale)

interface Props {
  data: { x: string; y: number }[]
}

const fillData = Array.from({ length: 48 }, (_, i) => ({
  x: i.toString(),
  y: 0,
}))

function BarChart({ data }: Props) {
  const ref = React.useRef<HTMLCanvasElement>(null)
  const [chart, setChart] = React.useState<Chart>()

  React.useEffect(() => {
    const chart = new Chart(ref.current!, {
      data: {
        datasets: [
          {
            backgroundColor: '#3b82f6',
            data: fillData.map((value) => value.y),
          },
        ],
        labels: fillData.map((value) => value.x),
      },
      options: {
        maintainAspectRatio: false,
        responsive: true,
      },
      type: 'bar',
    })

    setChart(chart)
  }, [])

  React.useEffect(() => {
    if (!chart) {
      return
    }

    chart.data.datasets[0].data = data.map((value) => value.y)
    chart.data.labels = data.map((value) => value.x)
    chart.update()
  }, [chart, data])

  return <canvas ref={ref} style={{ height: '150px', width: '100%' }} />
}

export default BarChart
