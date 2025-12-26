'use client';

import React, { useState } from 'react';
import { PageContainer } from '../../components/layout/PageContainer';
import { ResponsiveGrid } from '../../components/layout/ResponsiveGrid';
import { EevaCard, EevaButton, EevaInput } from '../../components/ui';

/**
 * Component Showcase Page
 * 
 * Demonstrates all the new design system components
 */
export default function ComponentShowcase() {
    const [inputValue, setInputValue] = useState('');
    const [textareaValue, setTextareaValue] = useState('');

    return (
        <PageContainer maxWidth="lg">
            <div style={{ padding: 'var(--space-xl) 0' }}>
                <h1 style={{
                    fontFamily: 'var(--font-family)',
                    fontSize: 'var(--text-h1)',
                    color: 'var(--text-primary)',
                    marginBottom: 'var(--space-lg)'
                }}>
                    Design System Components
                </h1>

                {/* Cards Section */}
                <section style={{ marginBottom: 'var(--space-3xl)' }}>
                    <h2 style={{
                        fontFamily: 'var(--font-family)',
                        fontSize: 'var(--text-h2)',
                        color: 'var(--text-primary)',
                        marginBottom: 'var(--space-lg)'
                    }}>
                        Cards
                    </h2>

                    <ResponsiveGrid columns={3} gap="lg">
                        <EevaCard variant="default">
                            <h3 style={{ marginBottom: 'var(--space-sm)' }}>Default Card</h3>
                            <p style={{ color: 'var(--text-secondary)' }}>
                                Standard card with subtle shadow
                            </p>
                        </EevaCard>

                        <EevaCard variant="elevated">
                            <h3 style={{ marginBottom: 'var(--space-sm)' }}>Elevated Card</h3>
                            <p style={{ color: 'var(--text-secondary)' }}>
                                Card with more prominent shadow
                            </p>
                        </EevaCard>

                        <EevaCard variant="outlined">
                            <h3 style={{ marginBottom: 'var(--space-sm)' }}>Outlined Card</h3>
                            <p style={{ color: 'var(--text-secondary)' }}>
                                Card with border, no shadow
                            </p>
                        </EevaCard>
                    </ResponsiveGrid>

                    <div style={{ marginTop: 'var(--space-lg)' }}>
                        <EevaCard
                            variant="elevated"
                            onClick={() => alert('Card clicked!')}
                        >
                            <h3 style={{ marginBottom: 'var(--space-sm)' }}>Clickable Card</h3>
                            <p style={{ color: 'var(--text-secondary)' }}>
                                This card is interactive - try clicking it!
                            </p>
                        </EevaCard>
                    </div>
                </section>

                {/* Buttons Section */}
                <section style={{ marginBottom: 'var(--space-3xl)' }}>
                    <h2 style={{
                        fontFamily: 'var(--font-family)',
                        fontSize: 'var(--text-h2)',
                        color: 'var(--text-primary)',
                        marginBottom: 'var(--space-lg)'
                    }}>
                        Buttons
                    </h2>

                    <EevaCard>
                        <h3 style={{ marginBottom: 'var(--space-md)' }}>Button Variants</h3>
                        <div style={{ display: 'flex', gap: 'var(--space-md)', flexWrap: 'wrap' }}>
                            <EevaButton variant="primary">Primary</EevaButton>
                            <EevaButton variant="secondary">Secondary</EevaButton>
                            <EevaButton variant="ghost">Ghost</EevaButton>
                            <EevaButton variant="danger">Danger</EevaButton>
                            <EevaButton variant="primary" disabled>Disabled</EevaButton>
                        </div>

                        <h3 style={{ marginTop: 'var(--space-xl)', marginBottom: 'var(--space-md)' }}>
                            Button Sizes
                        </h3>
                        <div style={{ display: 'flex', gap: 'var(--space-md)', alignItems: 'center', flexWrap: 'wrap' }}>
                            <EevaButton size="sm">Small</EevaButton>
                            <EevaButton size="md">Medium</EevaButton>
                            <EevaButton size="lg">Large</EevaButton>
                        </div>

                        <h3 style={{ marginTop: 'var(--space-xl)', marginBottom: 'var(--space-md)' }}>
                            Full Width Button
                        </h3>
                        <EevaButton variant="primary" fullWidth>
                            Full Width Button
                        </EevaButton>
                    </EevaCard>
                </section>

                {/* Inputs Section */}
                <section style={{ marginBottom: 'var(--space-3xl)' }}>
                    <h2 style={{
                        fontFamily: 'var(--font-family)',
                        fontSize: 'var(--text-h2)',
                        color: 'var(--text-primary)',
                        marginBottom: 'var(--space-lg)'
                    }}>
                        Form Inputs
                    </h2>

                    <ResponsiveGrid columns={2} gap="lg">
                        <EevaCard>
                            <h3 style={{ marginBottom: 'var(--space-md)' }}>Text Inputs</h3>

                            <div style={{ marginBottom: 'var(--space-lg)' }}>
                                <EevaInput
                                    label="Name"
                                    value={inputValue}
                                    onChange={setInputValue}
                                    placeholder="Enter your name"
                                />
                            </div>

                            <div style={{ marginBottom: 'var(--space-lg)' }}>
                                <EevaInput
                                    label="Email"
                                    type="email"
                                    value=""
                                    onChange={() => { }}
                                    placeholder="your@email.com"
                                    required
                                />
                            </div>

                            <div>
                                <EevaInput
                                    label="Password"
                                    type="password"
                                    value=""
                                    onChange={() => { }}
                                    placeholder="Enter password"
                                    error="Password must be at least 8 characters"
                                />
                            </div>
                        </EevaCard>

                        <EevaCard>
                            <h3 style={{ marginBottom: 'var(--space-md)' }}>Textarea</h3>

                            <EevaInput
                                label="Description"
                                value={textareaValue}
                                onChange={setTextareaValue}
                                placeholder="Enter a description..."
                                multiline
                                rows={6}
                            />

                            <div style={{ marginTop: 'var(--space-lg)' }}>
                                <EevaInput
                                    label="Disabled Input"
                                    value="This input is disabled"
                                    onChange={() => { }}
                                    disabled
                                />
                            </div>
                        </EevaCard>
                    </ResponsiveGrid>
                </section>

                {/* Layout Section */}
                <section style={{ marginBottom: 'var(--space-3xl)' }}>
                    <h2 style={{
                        fontFamily: 'var(--font-family)',
                        fontSize: 'var(--text-h2)',
                        color: 'var(--text-primary)',
                        marginBottom: 'var(--space-lg)'
                    }}>
                        Responsive Layouts
                    </h2>

                    <EevaCard>
                        <h3 style={{ marginBottom: 'var(--space-md)' }}>Responsive Grid</h3>
                        <p style={{ color: 'var(--text-secondary)', marginBottom: 'var(--space-lg)' }}>
                            This grid adapts: 1 column on mobile, 2 on tablet, 3 on desktop
                        </p>

                        <ResponsiveGrid columns={3} gap="md">
                            {[1, 2, 3, 4, 5, 6].map((num) => (
                                <div
                                    key={num}
                                    style={{
                                        background: 'var(--color-primary)',
                                        color: 'white',
                                        padding: 'var(--space-xl)',
                                        borderRadius: 'var(--radius-sm)',
                                        textAlign: 'center',
                                        fontWeight: 600
                                    }}
                                >
                                    Item {num}
                                </div>
                            ))}
                        </ResponsiveGrid>
                    </EevaCard>
                </section>

                {/* Design Tokens Section */}
                <section>
                    <h2 style={{
                        fontFamily: 'var(--font-family)',
                        fontSize: 'var(--text-h2)',
                        color: 'var(--text-primary)',
                        marginBottom: 'var(--space-lg)'
                    }}>
                        Design Tokens
                    </h2>

                    <ResponsiveGrid columns={2} gap="lg">
                        <EevaCard>
                            <h3 style={{ marginBottom: 'var(--space-md)' }}>Colors</h3>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-sm)' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-md)' }}>
                                    <div style={{ width: 40, height: 40, background: 'var(--color-primary)', borderRadius: 'var(--radius-sm)' }} />
                                    <span>Primary</span>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-md)' }}>
                                    <div style={{ width: 40, height: 40, background: 'var(--color-accent)', borderRadius: 'var(--radius-sm)' }} />
                                    <span>Accent</span>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-md)' }}>
                                    <div style={{ width: 40, height: 40, background: 'var(--color-success)', borderRadius: 'var(--radius-sm)' }} />
                                    <span>Success</span>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-md)' }}>
                                    <div style={{ width: 40, height: 40, background: 'var(--color-error)', borderRadius: 'var(--radius-sm)' }} />
                                    <span>Error</span>
                                </div>
                            </div>
                        </EevaCard>

                        <EevaCard>
                            <h3 style={{ marginBottom: 'var(--space-md)' }}>Spacing Scale</h3>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-sm)' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-md)' }}>
                                    <div style={{ width: 'var(--space-xs)', height: 20, background: 'var(--color-primary)' }} />
                                    <span>XS (4px)</span>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-md)' }}>
                                    <div style={{ width: 'var(--space-sm)', height: 20, background: 'var(--color-primary)' }} />
                                    <span>SM (8px)</span>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-md)' }}>
                                    <div style={{ width: 'var(--space-md)', height: 20, background: 'var(--color-primary)' }} />
                                    <span>MD (16px)</span>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-md)' }}>
                                    <div style={{ width: 'var(--space-lg)', height: 20, background: 'var(--color-primary)' }} />
                                    <span>LG (24px)</span>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-md)' }}>
                                    <div style={{ width: 'var(--space-xl)', height: 20, background: 'var(--color-primary)' }} />
                                    <span>XL (32px)</span>
                                </div>
                            </div>
                        </EevaCard>
                    </ResponsiveGrid>
                </section>
            </div>
        </PageContainer>
    );
}
