import * as React from "react"
import { View, Text, StyleSheet, ViewStyle, TextStyle } from "react-native"

export interface CardProps {
  children?: React.ReactNode
  style?: ViewStyle
}

const Card = React.forwardRef<View, CardProps>(
  ({ children, style, ...props }, ref) => (
    <View
      ref={ref}
      style={[styles.card, style]}
      {...props}
    >
      {children}
    </View>
  )
)
Card.displayName = "Card"

export interface CardHeaderProps {
  children?: React.ReactNode
  style?: ViewStyle
}

const CardHeader = React.forwardRef<View, CardHeaderProps>(
  ({ children, style, ...props }, ref) => (
    <View
      ref={ref}
      style={[styles.cardHeader, style]}
      {...props}
    >
      {children}
    </View>
  )
)
CardHeader.displayName = "CardHeader"

export interface CardTitleProps {
  children?: React.ReactNode
  style?: TextStyle
}

const CardTitle = React.forwardRef<Text, CardTitleProps>(
  ({ children, style, ...props }, ref) => (
    <Text
      ref={ref}
      style={[styles.cardTitle, style]}
      {...props}
    >
      {children}
    </Text>
  )
)
CardTitle.displayName = "CardTitle"

export interface CardDescriptionProps {
  children?: React.ReactNode
  style?: TextStyle
}

const CardDescription = React.forwardRef<Text, CardDescriptionProps>(
  ({ children, style, ...props }, ref) => (
    <Text
      ref={ref}
      style={[styles.cardDescription, style]}
      {...props}
    >
      {children}
    </Text>
  )
)
CardDescription.displayName = "CardDescription"

export interface CardContentProps {
  children?: React.ReactNode
  style?: ViewStyle
}

const CardContent = React.forwardRef<View, CardContentProps>(
  ({ children, style, ...props }, ref) => (
    <View ref={ref} style={[styles.cardContent, style]} {...props}>
      {children}
    </View>
  )
)
CardContent.displayName = "CardContent"

export interface CardFooterProps {
  children?: React.ReactNode
  style?: ViewStyle
}

const CardFooter = React.forwardRef<View, CardFooterProps>(
  ({ children, style, ...props }, ref) => (
    <View
      ref={ref}
      style={[styles.cardFooter, style]}
      {...props}
    >
      {children}
    </View>
  )
)
CardFooter.displayName = "CardFooter"

const styles = StyleSheet.create({
  card: {
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'column',
    padding: 24,
    paddingBottom: 6,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#111827',
    lineHeight: 24,
  },
  cardDescription: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 6,
  },
  cardContent: {
    padding: 24,
    paddingTop: 0,
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 24,
    paddingTop: 0,
  },
})

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent }
