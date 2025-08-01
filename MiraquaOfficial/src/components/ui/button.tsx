import * as React from "react"
import { TouchableOpacity, Text, StyleSheet, ViewStyle, TextStyle } from "react-native"

export interface ButtonProps {
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link'
  size?: 'default' | 'sm' | 'lg' | 'icon'
  disabled?: boolean
  onPress?: () => void
  children?: React.ReactNode
  style?: ViewStyle
  textStyle?: TextStyle
}

const Button = React.forwardRef<any, ButtonProps>(
  ({ 
    className, 
    variant = 'default', 
    size = 'default', 
    disabled = false, 
    onPress,
    children,
    style,
    textStyle,
    ...props 
  }, ref) => {
    const buttonStyle = [
      styles.base,
      styles[variant],
      size === 'default' ? styles.defaultSize : styles[size],
      disabled && styles.disabled,
      style
    ]

    const textStyles = [
      styles.text,
      styles[`${variant}Text`],
      size === 'default' ? styles.defaultSizeText : styles[`${size}Text`],
      disabled && styles.disabledText,
      textStyle
    ]

    return (
      <TouchableOpacity
        ref={ref}
        style={buttonStyle}
        onPress={onPress}
        disabled={disabled}
        activeOpacity={0.8}
        {...props}
      >
        {typeof children === 'string' ? (
          <Text style={textStyles}>{children}</Text>
        ) : (
          children
        )}
      </TouchableOpacity>
    )
  }
)

Button.displayName = "Button"

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
  },
  default: {
    backgroundColor: '#3B82F6',
  },
  destructive: {
    backgroundColor: '#EF4444',
  },
  outline: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#D1D5DB',
  },
  secondary: {
    backgroundColor: '#F3F4F6',
  },
  ghost: {
    backgroundColor: 'transparent',
  },
  link: {
    backgroundColor: 'transparent',
  },
  sm: {
    height: 36,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  defaultSize: {
    height: 40,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  lg: {
    height: 44,
    paddingHorizontal: 32,
    paddingVertical: 12,
  },
  icon: {
    height: 40,
    width: 40,
    padding: 0,
  },
  disabled: {
    opacity: 0.5,
  },
  text: {
    fontSize: 14,
    fontWeight: '500',
  },
  defaultText: {
    color: '#FFFFFF',
  },
  destructiveText: {
    color: '#FFFFFF',
  },
  outlineText: {
    color: '#374151',
  },
  secondaryText: {
    color: '#374151',
  },
  ghostText: {
    color: '#374151',
  },
  linkText: {
    color: '#3B82F6',
    textDecorationLine: 'underline',
  },
  smText: {
    fontSize: 12,
  },
  defaultSizeText: {
    fontSize: 14,
  },
  lgText: {
    fontSize: 16,
  },
  iconText: {
    fontSize: 14,
  },
  disabledText: {
    color: '#9CA3AF',
  },
})

export { Button }
