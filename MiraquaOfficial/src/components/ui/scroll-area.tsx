import * as React from "react"
import { ScrollView, StyleSheet, ViewStyle } from "react-native"

export interface ScrollAreaProps {
  children?: React.ReactNode
  style?: ViewStyle
  contentContainerStyle?: ViewStyle
  showsVerticalScrollIndicator?: boolean
  showsHorizontalScrollIndicator?: boolean
  refreshControl?: React.ReactElement
  onRefresh?: () => void
  refreshing?: boolean
}

const ScrollArea = React.forwardRef<ScrollView, ScrollAreaProps>(
  ({ 
    children, 
    style, 
    contentContainerStyle,
    showsVerticalScrollIndicator = false,
    showsHorizontalScrollIndicator = false,
    refreshControl,
    onRefresh,
    refreshing = false,
    ...props 
  }, ref) => {
    return (
      <ScrollView
        ref={ref}
        style={[styles.scrollArea, style]}
        contentContainerStyle={[styles.contentContainer, contentContainerStyle]}
        showsVerticalScrollIndicator={showsVerticalScrollIndicator}
        showsHorizontalScrollIndicator={showsHorizontalScrollIndicator}
        refreshControl={refreshControl}
        onRefresh={onRefresh}
        refreshing={refreshing}
        {...props}
      >
        {children}
      </ScrollView>
    )
  }
)

ScrollArea.displayName = "ScrollArea"

const styles = StyleSheet.create({
  scrollArea: {
    flex: 1,
  },
  contentContainer: {
    flexGrow: 1,
  },
})

export { ScrollArea }
