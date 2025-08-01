import * as React from "react"
import { View, StyleSheet, ViewStyle } from "react-native"

export interface ProgressProps {
  value?: number
  max?: number
  style?: ViewStyle
  progressStyle?: ViewStyle
}

const Progress = React.forwardRef<View, ProgressProps>(
  ({ value = 0, max = 100, style, progressStyle, ...props }, ref) => {
    const percentage = Math.min(Math.max((value / max) * 100, 0), 100)

    return (
      <View
        ref={ref}
        style={[styles.container, style]}
        {...props}
      >
        <View style={[styles.progress, { width: `${percentage}%` }, progressStyle]} />
      </View>
    )
  }
)

Progress.displayName = "Progress"

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: 8,
    backgroundColor: '#F3F4F6',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progress: {
    height: '100%',
    backgroundColor: '#3B82F6',
    borderRadius: 4,
  },
})

export { Progress }
