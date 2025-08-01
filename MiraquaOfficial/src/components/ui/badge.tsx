import * as React from "react"
import { View, Text, StyleSheet, ViewStyle, TextStyle } from "react-native"

export interface BadgeProps {
  variant?: 'default' | 'secondary' | 'destructive' | 'outline'
  children?: React.ReactNode
  style?: ViewStyle
  textStyle?: TextStyle
}

const Badge = React.forwardRef<View, BadgeProps>(
  ({ variant = 'default', children, style, textStyle, ...props }, ref) => {
    const badgeStyle = [
      styles.base,
      styles[variant],
      style
    ]

    const textStyles = [
      styles.text,
      styles[`${variant}Text`],
      textStyle
    ]

    return (
      <View
        ref={ref}
        style={badgeStyle}
        {...props}
      >
        {typeof children === 'string' ? (
          <Text style={textStyles}>{children}</Text>
        ) : (
          children
        )}
      </View>
    )
  }
)

Badge.displayName = "Badge"

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  default: {
    backgroundColor: '#3B82F6',
  },
  secondary: {
    backgroundColor: '#F3F4F6',
  },
  destructive: {
    backgroundColor: '#EF4444',
  },
  outline: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#D1D5DB',
  },
  text: {
    fontSize: 12,
    fontWeight: '500',
    lineHeight: 16,
  },
  defaultText: {
    color: '#FFFFFF',
  },
  secondaryText: {
    color: '#374151',
  },
  destructiveText: {
    color: '#FFFFFF',
  },
  outlineText: {
    color: '#374151',
  },
})

export { Badge }
