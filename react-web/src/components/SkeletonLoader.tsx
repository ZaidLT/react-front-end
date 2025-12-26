'use client';

import React from 'react';
import { Colors } from '../styles';

interface SkeletonLoaderProps {
  width?: string | number;
  height?: string | number;
  borderRadius?: string | number;
  style?: React.CSSProperties;
  className?: string;
}

const SkeletonLoader: React.FC<SkeletonLoaderProps> = ({
  width = '100%',
  height = '20px',
  borderRadius = '4px',
  style = {},
  className = '',
}) => {
  return (
    <div
      className={`skeleton-loader ${className}`}
      style={{
        width,
        height,
        borderRadius,
        backgroundColor: Colors.LIGHT_GREY || '#f0f0f0',
        position: 'relative',
        overflow: 'hidden',
        ...style,
      }}
    >
      <div
        className="skeleton-shimmer"
        style={{
          position: 'absolute',
          top: 0,
          left: '-100%',
          width: '100%',
          height: '100%',
          background: `linear-gradient(
            90deg,
            transparent,
            rgba(255, 255, 255, 0.6),
            transparent
          )`,
          animation: 'shimmer 1.5s infinite',
        }}
      />
      <style jsx>{`
        @keyframes shimmer {
          0% {
            left: -100%;
          }
          100% {
            left: 100%;
          }
        }
      `}</style>
    </div>
  );
};

// Profile-specific skeleton components
export const ProfileUserInfoSkeleton: React.FC = () => {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: '16px',
      marginBottom: '32px',
      padding: '24px',
      backgroundColor: Colors.WHITE,
      borderRadius: '12px',
      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
    }}>
      {/* Avatar skeleton */}
      <SkeletonLoader
        width="80px"
        height="80px"
        borderRadius="50%"
        style={{ flexShrink: 0 }}
      />
      
      {/* Text content skeleton */}
      <div style={{ flex: 1 }}>
        <SkeletonLoader
          width="60%"
          height="24px"
          style={{ marginBottom: '8px' }}
        />
        <SkeletonLoader
          width="40%"
          height="16px"
        />
      </div>
    </div>
  );
};

export const ProfileDetailsSkeleton: React.FC = () => {
  return (
    <div style={{
      backgroundColor: Colors.WHITE,
      borderRadius: '12px',
      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
      marginBottom: '32px',
    }}>
      {[1, 2, 3].map((index) => (
        <div
          key={index}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
            padding: '20px 24px',
            borderBottom: index < 3 ? `1px solid ${Colors.LIGHT_GREY}` : 'none',
          }}
        >
          {/* Icon skeleton */}
          <SkeletonLoader
            width="20px"
            height="20px"
            borderRadius="4px"
            style={{ flexShrink: 0 }}
          />
          
          {/* Content skeleton */}
          <div style={{ flex: 1 }}>
            <SkeletonLoader
              width="30%"
              height="12px"
              style={{ marginBottom: '8px' }}
            />
            <SkeletonLoader
              width="70%"
              height="16px"
            />
          </div>
        </div>
      ))}
    </div>
  );
};

export const ProfileActionButtonsSkeleton: React.FC = () => {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      gap: '16px',
    }}>
      <SkeletonLoader
        width="100%"
        height="52px"
        borderRadius="8px"
      />
      <SkeletonLoader
        width="100%"
        height="52px"
        borderRadius="8px"
      />
    </div>
  );
};

// Life tab specific skeleton components
export const LifeFamilyMembersSkeleton: React.FC = () => {
  return (
    <div style={{
      padding: '16px 0',
      borderBottom: `1px solid ${Colors.LIGHT_GREY}`,
    }}>
      {/* Section title skeleton */}
      <SkeletonLoader
        width="120px"
        height="24px"
        style={{ marginBottom: '12px' }}
      />

      {/* Family members horizontal scroll skeleton */}
      <div style={{
        display: 'flex',
        flexDirection: 'row',
        gap: '12px',
        overflowX: 'auto',
        paddingBottom: '8px'
      }}>
        {[1, 2, 3].map((index) => (
          <div
            key={index}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              minWidth: '80px',
              flexShrink: 0
            }}
          >
            {/* Avatar skeleton */}
            <SkeletonLoader
              width="60px"
              height="60px"
              borderRadius="50%"
              style={{ marginBottom: '8px' }}
            />
            {/* Name skeleton */}
            <SkeletonLoader
              width="50px"
              height="14px"
              borderRadius="8px"
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export const LifeEveryonesStuffSkeleton: React.FC = () => {
  return (
    <div style={{
      padding: '20px 0',
      borderBottom: `1px solid ${Colors.LIGHT_GREY}`,
    }}>
      {/* Section title skeleton */}
      <SkeletonLoader
        width="160px"
        height="24px"
        style={{ marginBottom: '16px' }}
      />

      {/* Four items in a row */}
      <div style={{
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: '12px',
        maxWidth: '400px',
        margin: '0 auto'
      }}>
        {[1, 2, 3, 4].map((index) => (
          <div
            key={index}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              flex: 1,
              padding: '16px 8px',
              backgroundColor: Colors.WHITE,
              borderRadius: '12px',
              border: `1px solid ${Colors.LIGHT_GREY}`,
            }}
          >
            {/* Icon skeleton */}
            <SkeletonLoader
              width="24px"
              height="24px"
              borderRadius="4px"
              style={{ marginBottom: '8px' }}
            />
            {/* Number skeleton */}
            <SkeletonLoader
              width="20px"
              height="18px"
              style={{ marginBottom: '4px' }}
            />
            {/* Label skeleton */}
            <SkeletonLoader
              width="40px"
              height="12px"
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export const LifeWeeklyStatsSkeleton: React.FC = () => {
  return (
    <div style={{
      padding: '20px 0'
    }}>
      {/* Section title skeleton */}
      <SkeletonLoader
        width="140px"
        height="24px"
        style={{ marginBottom: '16px' }}
      />

      {/* Weekly stats cards */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '15px'
      }}>
        {/* Large cards */}
        {[1, 2, 3].map((index) => (
          <div
            key={index}
            style={{
              backgroundColor: Colors.WHITE,
              borderRadius: '12px',
              padding: '20px',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
            }}
          >
            {/* Header with number and title */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '16px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <SkeletonLoader width="32px" height="32px" borderRadius="50%" />
                <div>
                  <SkeletonLoader width="80px" height="18px" style={{ marginBottom: '4px' }} />
                  <SkeletonLoader width="60px" height="14px" />
                </div>
              </div>
              <SkeletonLoader width="60px" height="14px" />
            </div>

            {/* Content items */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {[1, 2].map((itemIndex) => (
                <div
                  key={itemIndex}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '8px 0'
                  }}
                >
                  <SkeletonLoader width="8px" height="8px" borderRadius="50%" />
                  <SkeletonLoader width="70%" height="14px" />
                </div>
              ))}
            </div>
          </div>
        ))}

        {/* Small cards row */}
        <div style={{
          display: 'flex',
          flexDirection: 'row',
          gap: '15px',
          marginBottom: '120px'
        }}>
          {[1, 2].map((index) => (
            <div
              key={index}
              style={{
                flex: 1,
                backgroundColor: Colors.WHITE,
                borderRadius: '12px',
                padding: '16px',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
              }}
            >
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '12px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <SkeletonLoader width="24px" height="24px" borderRadius="50%" />
                  <div>
                    <SkeletonLoader width="60px" height="16px" style={{ marginBottom: '4px' }} />
                    <SkeletonLoader width="40px" height="12px" />
                  </div>
                </div>
                <SkeletonLoader width="40px" height="12px" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// Individual Weekly Stats Card Skeleton
export const WeeklyStatsCardSkeleton: React.FC = () => {
  return (
    <div style={{
      backgroundColor: Colors.WHITE,
      borderRadius: '10px',
      padding: '15px',
      boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
      maxHeight: '200px'
    }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '8px'
      }}>
        <div style={{
          display: 'flex',
          flexDirection: 'row',
          gap: '10px',
          alignItems: 'center'
        }}>
          {/* Number skeleton */}
          <SkeletonLoader
            width="60px"
            height="40px"
            style={{ marginBottom: '4px' }}
          />
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '4px'
          }}>
            {/* Title skeleton */}
            <SkeletonLoader
              width="80px"
              height="16px"
            />
            {/* Subtitle skeleton */}
            <SkeletonLoader
              width="60px"
              height="16px"
            />
          </div>
        </div>

        {/* Chevron skeleton */}
        <SkeletonLoader
          width="20px"
          height="20px"
          borderRadius="4px"
        />
      </div>

      {/* Items */}
      {[1, 2].map((index) => (
        <div
          key={index}
          style={{
            marginTop: '10px',
            padding: '8px 0',
            border: `1px solid ${Colors.LIGHT_GREY}`,
            borderRadius: '10px',
            paddingLeft: '10px',
            display: 'flex',
            flexDirection: 'row',
            gap: '6px',
            alignItems: 'center'
          }}
        >
          {/* Color bar skeleton */}
          <SkeletonLoader
            width="4px"
            height="16px"
            borderRadius="8px"
          />
          {/* Item title skeleton */}
          <SkeletonLoader
            width="70%"
            height="14px"
          />
        </div>
      ))}
    </div>
  );
};

// Small Weekly Stats Card Skeleton
export const WeeklyStatsSmallCardSkeleton: React.FC = () => {
  return (
    <div style={{
      flex: 1,
      backgroundColor: Colors.WHITE,
      borderRadius: '10px',
      padding: '15px',
      boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
    }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '8px'
      }}>
        {/* Number skeleton */}
        <SkeletonLoader
          width="50px"
          height="40px"
        />

        {/* Chevron skeleton */}
        <SkeletonLoader
          width="20px"
          height="20px"
          borderRadius="4px"
        />
      </div>

      {/* Title and subtitle */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '4px'
      }}>
        <SkeletonLoader
          width="60px"
          height="16px"
        />
        <SkeletonLoader
          width="50px"
          height="16px"
        />
      </div>
    </div>
  );
};

// All-Dents List Item Skeleton
export const AllDentsItemSkeleton: React.FC = () => {
  return (
    <div style={{
      backgroundColor: Colors.WHITE,
      borderRadius: '12px',
      padding: '16px',
      marginBottom: '12px',
      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
      border: `1px solid ${Colors.LIGHT_GREY}`
    }}>
      {/* Header with priority and type */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: '12px'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          {/* Priority/status indicator */}
          <SkeletonLoader
            width="8px"
            height="8px"
            borderRadius="50%"
          />
          {/* Type badge */}
          <SkeletonLoader
            width="60px"
            height="20px"
            borderRadius="10px"
          />
        </div>

        {/* Date */}
        <SkeletonLoader
          width="80px"
          height="14px"
        />
      </div>

      {/* Title */}
      <SkeletonLoader
        width="85%"
        height="18px"
        style={{ marginBottom: '8px' }}
      />

      {/* Description */}
      <SkeletonLoader
        width="70%"
        height="14px"
        style={{ marginBottom: '12px' }}
      />

      {/* Footer with creator and actions */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          {/* Creator avatar */}
          <SkeletonLoader
            width="24px"
            height="24px"
            borderRadius="50%"
          />
          {/* Creator name */}
          <SkeletonLoader
            width="60px"
            height="14px"
          />
        </div>

        {/* Action button */}
        <SkeletonLoader
          width="24px"
          height="24px"
          borderRadius="4px"
        />
      </div>
    </div>
  );
};

// All-Dents Page Skeleton (multiple items)
export const AllDentsPageSkeleton: React.FC = () => {
  return (
    <div style={{
      maxWidth: '800px',
      width: '100%',
      padding: '0 20px 100px 20px',
      boxSizing: 'border-box'
    }}>
      {[1, 2, 3, 4, 5, 6].map((index) => (
        <AllDentsItemSkeleton key={index} />
      ))}
    </div>
  );
};

// Task List Item Skeleton (for incomplete/completed tasks pages)
export const TaskListItemSkeleton: React.FC = () => {
  return (
    <div style={{
      backgroundColor: Colors.WHITE,
      borderRadius: '12px',
      padding: '16px',
      marginBottom: '12px',
      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
      border: `1px solid ${Colors.LIGHT_GREY}`
    }}>
      {/* Header with checkbox and priority */}
      <div style={{
        display: 'flex',
        alignItems: 'flex-start',
        marginBottom: '12px'
      }}>
        {/* Checkbox skeleton */}
        <SkeletonLoader
          width="20px"
          height="20px"
          borderRadius="4px"
          style={{ marginRight: '12px', marginTop: '2px' }}
        />

        <div style={{ flex: 1 }}>
          {/* Title */}
          <SkeletonLoader
            width="75%"
            height="18px"
            style={{ marginBottom: '8px' }}
          />

          {/* Description */}
          <SkeletonLoader
            width="60%"
            height="14px"
            style={{ marginBottom: '12px' }}
          />

          {/* Date and time info */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
            marginBottom: '8px'
          }}>
            <SkeletonLoader width="80px" height="12px" />
            <SkeletonLoader width="60px" height="12px" />
          </div>
        </div>

        {/* Priority indicator */}
        <SkeletonLoader
          width="8px"
          height="40px"
          borderRadius="4px"
        />
      </div>

      {/* Footer with creator and actions */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          {/* Creator avatar */}
          <SkeletonLoader
            width="24px"
            height="24px"
            borderRadius="50%"
          />
          {/* Creator name */}
          <SkeletonLoader
            width="60px"
            height="14px"
          />
        </div>

        {/* Action buttons */}
        <div style={{
          display: 'flex',
          gap: '8px'
        }}>
          <SkeletonLoader width="24px" height="24px" borderRadius="4px" />
          <SkeletonLoader width="24px" height="24px" borderRadius="4px" />
        </div>
      </div>
    </div>
  );
};

// Task List Page Skeleton (multiple task items)
export const TaskListPageSkeleton: React.FC = () => {
  return (
    <div style={{
      maxWidth: '800px',
      width: '100%',
      padding: '0 20px 100px 20px',
      boxSizing: 'border-box'
    }}>
      {[1, 2, 3, 4, 5, 6].map((index) => (
        <TaskListItemSkeleton key={index} />
      ))}
    </div>
  );
};

// Activity List Item Skeleton (for activities page)
export const ActivityListItemSkeleton: React.FC = () => {
  return (
    <div style={{
      backgroundColor: Colors.WHITE,
      borderRadius: '12px',
      padding: '16px',
      marginBottom: '12px',
      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
      border: `1px solid ${Colors.LIGHT_GREY}`
    }}>
      {/* Header with avatar and info */}
      <div style={{
        display: 'flex',
        alignItems: 'flex-start',
        marginBottom: '12px'
      }}>
        {/* Avatar */}
        <SkeletonLoader
          width="40px"
          height="40px"
          borderRadius="50%"
          style={{ marginRight: '12px' }}
        />

        <div style={{ flex: 1 }}>
          {/* Name and action */}
          <SkeletonLoader
            width="70%"
            height="16px"
            style={{ marginBottom: '4px' }}
          />

          {/* Time */}
          <SkeletonLoader
            width="50px"
            height="12px"
          />
        </div>

        {/* Activity type icon */}
        <SkeletonLoader
          width="24px"
          height="24px"
          borderRadius="4px"
        />
      </div>

      {/* Activity content */}
      <SkeletonLoader
        width="85%"
        height="14px"
        style={{ marginBottom: '8px' }}
      />

      <SkeletonLoader
        width="60%"
        height="14px"
      />
    </div>
  );
};

// Activity List Page Skeleton
export const ActivityListPageSkeleton: React.FC = () => {
  return (
    <div style={{
      maxWidth: '800px',
      width: '100%',
      padding: '0 20px 100px 20px',
      boxSizing: 'border-box'
    }}>
      {[1, 2, 3, 4, 5].map((index) => (
        <ActivityListItemSkeleton key={index} />
      ))}
    </div>
  );
};

// View Task Page Skeleton
export const ViewTaskSkeleton: React.FC = () => {
  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: Colors.WHITE,
      display: 'flex',
      flexDirection: 'column'
    }}>
      {/* Header Skeleton */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '20px 20px',
        borderBottom: `1px solid ${Colors.LIGHT_GREY}`,
        backgroundColor: Colors.WHITE,
        maxWidth: '800px',
        margin: '0 auto',
        width: '100%',
        boxSizing: 'border-box'
      }}>
        {/* Back button skeleton */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <SkeletonLoader width="24px" height="24px" borderRadius="4px" />
          <SkeletonLoader width="40px" height="16px" />
        </div>

        {/* Title skeleton */}
        <SkeletonLoader width="80px" height="18px" />

        {/* Action buttons skeleton */}
        <div style={{ display: 'flex', gap: '10px' }}>
          <SkeletonLoader width="24px" height="24px" borderRadius="4px" />
          <SkeletonLoader width="24px" height="24px" borderRadius="4px" />
          <SkeletonLoader width="24px" height="24px" borderRadius="4px" />
        </div>
      </div>

      {/* Content Skeleton */}
      <div style={{
        maxWidth: '800px',
        margin: '0 auto',
        width: '100%',
        padding: '40px 20px',
        boxSizing: 'border-box',
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        gap: '40px'
      }}>
        {/* Task Title Skeleton */}
        <div>
          <SkeletonLoader width="80%" height="24px" style={{ marginBottom: '8px' }} />
          <SkeletonLoader width="60%" height="24px" />
        </div>

        {/* Task Description Skeleton */}
        <div>
          <SkeletonLoader width="100%" height="16px" style={{ marginBottom: '8px' }} />
          <SkeletonLoader width="90%" height="16px" style={{ marginBottom: '8px' }} />
          <SkeletonLoader width="70%" height="16px" />
        </div>

        {/* Date & Time Section Skeleton */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <SkeletonLoader width="80px" height="12px" />
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <SkeletonLoader width="20px" height="20px" borderRadius="4px" />
            <SkeletonLoader width="120px" height="16px" />
          </div>
        </div>

        {/* Notification Section Skeleton */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <SkeletonLoader width="80px" height="12px" />
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <SkeletonLoader width="20px" height="20px" borderRadius="4px" />
            <SkeletonLoader width="100px" height="16px" />
          </div>
        </div>

        {/* Hive Section Skeleton */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <SkeletonLoader width="40px" height="12px" />
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <SkeletonLoader width="24px" height="24px" borderRadius="4px" />
            <SkeletonLoader width="120px" height="16px" />
          </div>
        </div>

        {/* Privacy and Hide From Section Skeleton */}
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: '20px' }}>
          {/* Privacy Section */}
          <div style={{ flex: 1 }}>
            <SkeletonLoader width="60px" height="12px" style={{ marginBottom: '10px' }} />
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <SkeletonLoader width="20px" height="20px" borderRadius="4px" />
              <SkeletonLoader width="140px" height="16px" />
            </div>
          </div>

          {/* Hide From Section */}
          <div style={{ flex: 1 }}>
            <SkeletonLoader width="70px" height="12px" style={{ marginBottom: '10px' }} />
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <SkeletonLoader width="20px" height="20px" borderRadius="4px" />
              <SkeletonLoader width="80px" height="16px" />
            </div>
          </div>
        </div>

        {/* Priority Section Skeleton */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <SkeletonLoader width="60px" height="12px" />
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <SkeletonLoader width="8px" height="8px" borderRadius="50%" />
            <SkeletonLoader width="80px" height="16px" />
          </div>
        </div>

        {/* Assigned To Section Skeleton */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <SkeletonLoader width="80px" height="12px" />
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <SkeletonLoader width="32px" height="32px" borderRadius="50%" />
            <SkeletonLoader width="100px" height="16px" />
          </div>
        </div>
      </div>
    </div>
  );
};

// Edit Task Page Skeleton
export const EditTaskSkeleton: React.FC = () => {
  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: Colors.WHITE,
      maxWidth: '600px',
      margin: '0 auto',
      display: 'flex',
      flexDirection: 'column',
    }}>
      {/* Header Skeleton */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '20px 20px',
        borderBottom: `1px solid ${Colors.LIGHT_GREY}`,
        backgroundColor: Colors.WHITE,
      }}>
        {/* Back button skeleton */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <SkeletonLoader width="24px" height="24px" borderRadius="4px" />
          <SkeletonLoader width="40px" height="16px" />
        </div>

        {/* Title skeleton */}
        <SkeletonLoader width="80px" height="18px" />

        {/* Save button skeleton */}
        <SkeletonLoader width="50px" height="16px" />
      </div>

      {/* Scrollable Content Skeleton */}
      <div style={{
        flex: 1,
        marginLeft: '5%',
        marginRight: '5%',
        paddingBottom: '100px',
      }}>
        {/* Title and Note Input Section Skeleton */}
        <div style={{
          marginTop: '20px',
          marginBottom: '20px',
        }}>
          <SkeletonLoader width="100%" height="24px" style={{ marginBottom: '10px' }} />
          <div style={{
            width: '90%',
            alignSelf: 'center',
            marginTop: '10px',
            marginBottom: '10px',
          }}>
            <SkeletonLoader width="100%" height="1px" />
          </div>
          <SkeletonLoader width="100%" height="100px" borderRadius="4px" />
        </div>

        <div style={{ marginTop: '20px', marginBottom: '20px' }}>
          <SkeletonLoader width="100%" height="1px" />
        </div>

        {/* Menu Items Skeleton */}
        {[1, 2, 3, 4, 5, 6, 7, 8].map((index) => (
          <div key={index} style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '16px 0',
            borderBottom: `1px solid ${Colors.LIGHT_GREY}`,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <SkeletonLoader width="24px" height="24px" borderRadius="4px" />
              <div>
                <SkeletonLoader width="120px" height="16px" style={{ marginBottom: '4px' }} />
                <SkeletonLoader width="80px" height="12px" />
              </div>
            </div>
            <SkeletonLoader width="20px" height="20px" borderRadius="4px" />
          </div>
        ))}

        {/* Bottom spacing */}
        <div style={{ height: '40px' }} />
      </div>
    </div>
  );
};

// Home Page Skeleton Components
export const HomePageHeaderSkeleton: React.FC = () => {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '24px 0 16px 0',
      marginBottom: '24px'
    }}>
      {/* Left side - greeting and name */}
      <div style={{ flex: 1 }}>
        <SkeletonLoader
          width="120px"
          height="20px"
          style={{ marginBottom: '8px' }}
        />
        <SkeletonLoader
          width="180px"
          height="28px"
        />
      </div>

      {/* Right side - notification bell */}
      <SkeletonLoader
        width="32px"
        height="32px"
        borderRadius="50%"
      />
    </div>
  );
};

export const HomeUrgentItemsSkeleton: React.FC = () => {
  return (
    <div style={{
      marginBottom: '32px'
    }}>
      {/* Section title */}
      <SkeletonLoader
        width="160px"
        height="24px"
        style={{ marginBottom: '16px' }}
      />

      {/* Urgent items list */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '12px'
      }}>
        {[1, 2, 3].map((index) => (
          <div
            key={index}
            style={{
              backgroundColor: Colors.WHITE,
              borderRadius: '12px',
              padding: '16px',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
              border: `1px solid ${Colors.LIGHT_GREY}`
            }}
          >
            {/* Header with type indicator and priority */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '12px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <SkeletonLoader
                  width="20px"
                  height="20px"
                  borderRadius="4px"
                />
                <SkeletonLoader
                  width="60px"
                  height="14px"
                />
              </div>
              <SkeletonLoader
                width="24px"
                height="24px"
                borderRadius="50%"
              />
            </div>

            {/* Title */}
            <SkeletonLoader
              width="80%"
              height="18px"
              style={{ marginBottom: '8px' }}
            />

            {/* Description */}
            <SkeletonLoader
              width="60%"
              height="14px"
              style={{ marginBottom: '12px' }}
            />

            {/* Footer with avatars and date */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <SkeletonLoader
                  width="24px"
                  height="24px"
                  borderRadius="50%"
                />
                <SkeletonLoader
                  width="24px"
                  height="24px"
                  borderRadius="50%"
                />
              </div>
              <SkeletonLoader
                width="80px"
                height="14px"
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export const HomeHexTilesSkeleton: React.FC = () => {
  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      width: '100%',
      padding: '20px 0'
    }}>
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '16px',
        maxWidth: '600px'
      }}>
        {/* First row - 2 tiles */}
        <div style={{
          display: 'flex',
          gap: '12px',
          justifyContent: 'center'
        }}>
          <SkeletonLoader
            width="120px"
            height="140px"
            borderRadius="12px"
          />
          <SkeletonLoader
            width="120px"
            height="140px"
            borderRadius="12px"
          />
        </div>

        {/* Second row - 1 tile centered */}
        <div style={{
          display: 'flex',
          justifyContent: 'center'
        }}>
          <SkeletonLoader
            width="120px"
            height="140px"
            borderRadius="12px"
          />
        </div>
      </div>
    </div>
  );
};

export const HomePageSkeleton: React.FC<{ isMobileApp?: boolean }> = ({ isMobileApp = false }) => {
  return (
    <div style={{
      position: 'relative',
      minHeight: '100vh',
      backgroundColor: 'transparent',
      display: 'flex',
      flexDirection: 'column',
      width: '100%',
      zIndex: 1
    }}>
      {/* Background gradient */}
      <div style={{
        position: 'fixed',
        top: 380,
        left: 0,
        right: 0,
        bottom: 0,
        width: '100%',
        height: '100%',
        backgroundImage: 'url(/pointed-gradient-background.svg)',
        backgroundSize: 'cover',
        backgroundPosition: 'top center',
        backgroundRepeat: 'no-repeat',
        zIndex: -1,
        pointerEvents: 'none'
      }} />

      {/* Content Container */}
      <div style={{
        maxWidth: '800px',
        margin: '0 auto',
        width: '100%',
        padding: '20px',
        boxSizing: 'border-box',
        flex: 1
      }}>
        {/* Page Header - Hide when mobile=true parameter is provided */}
        {!isMobileApp && <HomePageHeaderSkeleton />}

        {/* Urgent Items Section */}
        <HomeUrgentItemsSkeleton />

        {/* Hex Tiles Section */}
        <HomeHexTilesSkeleton />
      </div>

      {/* Tab Bar Skeleton */}
      <div style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        height: '80px',
        backgroundColor: Colors.WHITE,
        borderTop: `1px solid ${Colors.LIGHT_GREY}`,
        display: 'flex',
        justifyContent: 'space-around',
        alignItems: 'center',
        padding: '0 20px',
        zIndex: 100
      }}>
        {[1, 2, 3, 4, 5].map((index) => (
          <div key={index} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
            <SkeletonLoader
              width="24px"
              height="24px"
              borderRadius="4px"
            />
            <SkeletonLoader
              width="40px"
              height="12px"
            />
          </div>
        ))}
      </div>
    </div>
  );
};

// Time Page Skeleton Components
export const TimePageHeaderSkeleton: React.FC = () => {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '20px 0',
      marginBottom: '16px'
    }}>
      {/* Left side - current date */}
      <div style={{ flex: 1 }}>
        <SkeletonLoader
          width="140px"
          height="24px"
          style={{ marginBottom: '4px' }}
        />
        <SkeletonLoader
          width="100px"
          height="16px"
        />
      </div>

      {/* Right side - view selector */}
      <SkeletonLoader
        width="80px"
        height="36px"
        borderRadius="8px"
      />
    </div>
  );
};

export const TimeCalendarSkeleton: React.FC = () => {
  return (
    <div style={{
      backgroundColor: Colors.WHITE,
      borderRadius: '12px',
      padding: '16px',
      marginBottom: '16px',
      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
    }}>
      {/* Week header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        marginBottom: '16px'
      }}>
        {[1, 2, 3, 4, 5, 6, 7].map((day) => (
          <div key={day} style={{ textAlign: 'center' }}>
            <SkeletonLoader
              width="20px"
              height="12px"
              style={{ marginBottom: '8px' }}
            />
            <SkeletonLoader
              width="32px"
              height="32px"
              borderRadius="50%"
            />
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(7, 1fr)',
        gap: '8px',
        marginTop: '16px'
      }}>
        {Array.from({ length: 35 }, (_, index) => (
          <SkeletonLoader
            key={index}
            width="32px"
            height="32px"
            borderRadius="4px"
          />
        ))}
      </div>
    </div>
  );
};

export const TimeEventListSkeleton: React.FC = () => {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      gap: '12px',
      marginTop: '16px'
    }}>
      {[1, 2, 3, 4].map((index) => (
        <div
          key={index}
          style={{
            backgroundColor: Colors.WHITE,
            borderRadius: '12px',
            padding: '16px',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
            border: `1px solid ${Colors.LIGHT_GREY}`
          }}
        >
          {/* Header with time and type */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '12px'
          }}>
            <SkeletonLoader
              width="80px"
              height="14px"
            />
            <SkeletonLoader
              width="20px"
              height="20px"
              borderRadius="4px"
            />
          </div>

          {/* Event title */}
          <SkeletonLoader
            width="70%"
            height="18px"
            style={{ marginBottom: '8px' }}
          />

          {/* Event details */}
          <SkeletonLoader
            width="50%"
            height="14px"
          />
        </div>
      ))}
    </div>
  );
};

export const TimePageSkeleton: React.FC = () => {
  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: Colors.WHITE,
      display: 'flex',
      flexDirection: 'column'
    }}>
      {/* Content Container */}
      <div style={{
        maxWidth: '800px',
        margin: '0 auto',
        width: '100%',
        padding: '20px',
        boxSizing: 'border-box',
        flex: 1
      }}>
        {/* Header */}
        <TimePageHeaderSkeleton />

        {/* Calendar */}
        <TimeCalendarSkeleton />

        {/* Events List */}
        <TimeEventListSkeleton />
      </div>

      {/* Tab Bar Skeleton */}
      <div style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        height: '80px',
        backgroundColor: Colors.WHITE,
        borderTop: `1px solid ${Colors.LIGHT_GREY}`,
        display: 'flex',
        justifyContent: 'space-around',
        alignItems: 'center',
        padding: '0 20px',
        zIndex: 100
      }}>
        {[1, 2, 3, 4, 5].map((index) => (
          <div key={index} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
            <SkeletonLoader
              width="24px"
              height="24px"
              borderRadius="4px"
            />
            <SkeletonLoader
              width="40px"
              height="12px"
            />
          </div>
        ))}
      </div>
    </div>
  );
};

// People Page Skeleton Components
export const PeoplePageHeaderSkeleton: React.FC = () => {
  return (
    <div style={{
      padding: '20px 0',
      marginBottom: '16px'
    }}>
      {/* Title */}
      <SkeletonLoader
        width="120px"
        height="28px"
        style={{ marginBottom: '16px' }}
      />

      {/* Search bar */}
      <SkeletonLoader
        width="100%"
        height="48px"
        borderRadius="8px"
        style={{ marginBottom: '16px' }}
      />

      {/* Filter pills */}
      <div style={{
        display: 'flex',
        gap: '8px',
        flexWrap: 'wrap'
      }}>
        {[1, 2, 3, 4].map((index) => (
          <SkeletonLoader
            key={index}
            width="80px"
            height="32px"
            borderRadius="16px"
          />
        ))}
      </div>
    </div>
  );
};

export const PeopleContactRowSkeleton: React.FC = () => {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      padding: '16px 0',
      borderBottom: `1px solid ${Colors.LIGHT_GREY}`
    }}>
      {/* Avatar */}
      <SkeletonLoader
        width="48px"
        height="48px"
        borderRadius="50%"
        style={{ marginRight: '16px' }}
      />

      {/* Contact info */}
      <div style={{ flex: 1 }}>
        <SkeletonLoader
          width="60%"
          height="18px"
          style={{ marginBottom: '4px' }}
        />
        <SkeletonLoader
          width="40%"
          height="14px"
        />
      </div>

      {/* Action button */}
      <SkeletonLoader
        width="24px"
        height="24px"
        borderRadius="4px"
      />
    </div>
  );
};

export const PeopleAlphabetSliderSkeleton: React.FC = () => {
  return (
    <div style={{
      position: 'absolute',
      right: '8px',
      top: '50%',
      transform: 'translateY(-50%)',
      display: 'flex',
      flexDirection: 'column',
      gap: '2px',
      backgroundColor: Colors.WHITE,
      borderRadius: '12px',
      padding: '8px 4px',
      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
    }}>
      {Array.from({ length: 26 }, (_, index) => (
        <SkeletonLoader
          key={index}
          width="12px"
          height="12px"
          borderRadius="2px"
        />
      ))}
    </div>
  );
};

export const PeopleContactListSkeleton: React.FC = () => {
  return (
    <div style={{
      position: 'relative',
      flex: 1,
      backgroundColor: Colors.WHITE,
      borderRadius: '12px',
      padding: '0 20px',
      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
    }}>
      {/* Contact rows */}
      <div>
        {Array.from({ length: 8 }, (_, index) => (
          <PeopleContactRowSkeleton key={index} />
        ))}
      </div>

      {/* Alphabet slider */}
      <PeopleAlphabetSliderSkeleton />
    </div>
  );
};

export const PeoplePageSkeleton: React.FC = () => {
  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#f0f8ff',
      display: 'flex',
      flexDirection: 'column'
    }}>
      {/* Content Container */}
      <div style={{
        maxWidth: '800px',
        margin: '0 auto',
        width: '100%',
        padding: '20px',
        boxSizing: 'border-box',
        flex: 1
      }}>
        {/* Header */}
        <PeoplePageHeaderSkeleton />

        {/* Toggle switch skeleton */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '20px',
          padding: '16px',
          backgroundColor: Colors.WHITE,
          borderRadius: '12px',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
        }}>
          <SkeletonLoader
            width="120px"
            height="18px"
          />
          <SkeletonLoader
            width="48px"
            height="24px"
            borderRadius="12px"
          />
        </div>

        {/* Contacts List */}
        <PeopleContactListSkeleton />
      </div>

      {/* Tab Bar Skeleton */}
      <div style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        height: '80px',
        backgroundColor: Colors.WHITE,
        borderTop: `1px solid ${Colors.LIGHT_GREY}`,
        display: 'flex',
        justifyContent: 'space-around',
        alignItems: 'center',
        padding: '0 20px',
        zIndex: 100
      }}>
        {[1, 2, 3, 4, 5].map((index) => (
          <div key={index} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
            <SkeletonLoader
              width="24px"
              height="24px"
              borderRadius="4px"
            />
            <SkeletonLoader
              width="40px"
              height="12px"
            />
          </div>
        ))}
      </div>
    </div>
  );
};

// House Hive Page Skeleton Components
export const HouseHiveHeaderSkeleton: React.FC = () => {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'flex-start',
      marginBottom: '30px',
      width: '100%'
    }}>
      {/* Back button skeleton */}
      <SkeletonLoader
        width="24px"
        height="24px"
        borderRadius="4px"
        style={{ marginLeft: '0px' }}
      />
    </div>
  );
};

export const HouseHiveDataCardSkeleton: React.FC = () => {
  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      marginBottom: '30px',
      width: '100%'
    }}>
      <div style={{
        backgroundColor: Colors.WHITE,
        borderRadius: '16px',
        padding: '24px',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
        width: '50%',
        maxWidth: '400px',
        minWidth: '300px'
      }}>
        {/* Main content area */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '16px'
        }}>
          {/* Title area */}
          <SkeletonLoader
            width="180px"
            height="24px"
            style={{ marginBottom: '8px' }}
          />

          {/* Description lines */}
          <SkeletonLoader
            width="100%"
            height="16px"
          />
          <SkeletonLoader
            width="85%"
            height="16px"
          />
          <SkeletonLoader
            width="70%"
            height="16px"
          />
        </div>
      </div>
    </div>
  );
};

export const HouseHiveToDoSkeleton: React.FC = () => {
  return (
    <div style={{ marginBottom: '30px' }}>
      {/* "To-do" title skeleton */}
      <SkeletonLoader
        width="80px"
        height="24px"
        style={{ marginBottom: '16px' }}
      />

      {/* Horizontal scrolling task cards */}
      <div style={{
        display: 'flex',
        gap: '16px',
        overflowX: 'auto',
        paddingBottom: '8px'
      }}>
        {/* Default "All things house" card skeleton */}
        <SkeletonLoader
          width="340px"
          height="120px"
          borderRadius="12px"
          style={{ flexShrink: 0 }}
        />

        {/* Additional task card skeletons */}
        <SkeletonLoader
          width="340px"
          height="120px"
          borderRadius="12px"
          style={{ flexShrink: 0 }}
        />
      </div>
    </div>
  );
};

export const HouseHiveHexTilesSkeleton: React.FC<{ isMobileApp?: boolean }> = ({ isMobileApp = false }) => {
  const tileSize = isMobileApp ? 100 : 120;

  return (
    <div style={{ marginTop: '0px' }}>
      {/* Hex tiles container */}
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        width: '100%',
        padding: '20px 0',
        position: 'relative',
        zIndex: 1,
      }}>
        {/* 2x2 grid of hex tile skeletons */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gridTemplateRows: 'repeat(2, 1fr)',
          gap: '20px',
          justifyItems: 'center',
          alignItems: 'center'
        }}>
          {/* Four hex tile skeletons */}
          {[1, 2, 3, 4].map((index) => (
            <SkeletonLoader
              key={index}
              width={`${tileSize}px`}
              height={`${tileSize}px`}
              borderRadius="12px"
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export const HouseHivePageSkeleton: React.FC<{ isMobileApp?: boolean }> = ({ isMobileApp = false }) => {
  return (
    <div className="house-hive-container">
      {/* Background gradient */}
      <div className="house-hive-background" />

      <div className="house-hive-content">
        {/* Header skeleton */}
        <HouseHiveHeaderSkeleton />

        {/* Quote skeleton */}
        <MyHiveQuoteSkeleton />

        {/* Data card skeleton */}
        <HouseHiveDataCardSkeleton />

        {/* Hex tiles skeleton */}
        <HouseHiveHexTilesSkeleton isMobileApp={isMobileApp} />
      </div>
    </div>
  );
};

// My Hive Page Skeleton Components
export const MyHiveQuoteSkeleton: React.FC = () => {
  return (
    <div style={{
      backgroundColor: Colors.WHITE,
      borderRadius: '16px',
      padding: '24px',
      marginBottom: '20px',
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
      textAlign: 'center'
    }}>
      {/* Quote text skeleton - reduced to 2 lines with proper spacing */}
      <SkeletonLoader
        width="85%"
        height="18px"
        style={{ marginBottom: '16px', margin: '0 auto 16px auto' }}
      />
      <SkeletonLoader
        width="65%"
        height="18px"
        style={{ marginBottom: '20px', margin: '0 auto 20px auto' }}
      />

      {/* Author skeleton */}
      <SkeletonLoader
        width="40%"
        height="14px"
        style={{ margin: '0 auto' }}
      />
    </div>
  );
};

export const MyHiveCentralIconSkeleton: React.FC = () => {
  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      margin: '30px 0',
      position: 'relative'
    }}>
      <SkeletonLoader
        width="80px"
        height="80px"
        borderRadius="50%"
      />
    </div>
  );
};

export const MyHiveHexTileSkeleton: React.FC = () => {
  return (
    <SkeletonLoader
      width="120px"
      height="120px"
      borderRadius="12px"
    />
  );
};

export const MyHiveHexTilesSkeleton: React.FC = () => {
  return (
    <div style={{ marginTop: '40px' }}>
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        width: '100%',
        padding: '20px 0',
        position: 'relative',
        zIndex: 1,
      }}>
        {/* Simulate DynamicGridLayout structure with more spacing */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          width: '100%',
        }}>
          {/* First row - 2 tiles */}
          <div style={{
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'center',
            alignItems: 'center',
            gap: '20px',
            marginBottom: '20px',
          }}>
            <MyHiveHexTileSkeleton />
            <MyHiveHexTileSkeleton />
          </div>

          {/* Second row - 3 tiles (including Add tile) */}
          <div style={{
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'center',
            alignItems: 'center',
            gap: '20px',
          }}>
            <MyHiveHexTileSkeleton />
            <MyHiveHexTileSkeleton />
            <MyHiveHexTileSkeleton />
          </div>
        </div>
      </div>
    </div>
  );
};

export const MyHivePageSkeleton: React.FC = () => {
  return (
    <>
      {/* Central icon skeleton */}
      <MyHiveCentralIconSkeleton />

      {/* Hex tiles section skeleton */}
      <MyHiveHexTilesSkeleton />
    </>
  );
};

// Property Detail Page Skeleton Components
export const PropertyDetailHeaderSkeleton: React.FC = () => {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '20px 20px',
      marginBottom: '20px'
    }}>
      {/* Back button skeleton */}
      <SkeletonLoader
        width="24px"
        height="24px"
        borderRadius="4px"
      />

      {/* Title skeleton */}
      <SkeletonLoader
        width="140px"
        height="18px"
      />

      {/* Edit button skeleton */}
      <SkeletonLoader
        width="24px"
        height="24px"
        borderRadius="4px"
      />
    </div>
  );
};

export const PropertyDetailHexSkeleton: React.FC<{ isMobileApp?: boolean }> = ({ isMobileApp = false }) => {
  const hexSize = isMobileApp ? 100 : 120;

  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      marginBottom: '30px'
    }}>
      <SkeletonLoader
        width={`${hexSize}px`}
        height={`${hexSize}px`}
        borderRadius="12px"
      />
    </div>
  );
};

export const PropertyDetailProviderCardSkeleton: React.FC = () => {
  return (
    <div style={{
      backgroundColor: Colors.WHITE,
      borderRadius: '12px',
      padding: '20px',
      marginBottom: '20px',
      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
    }}>
      {/* Provider header section */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '16px',
        marginBottom: '20px'
      }}>
        {/* Provider image placeholder */}
        <SkeletonLoader
          width="48px"
          height="48px"
          borderRadius="8px"
        />

        {/* Provider name section */}
        <div style={{ flex: 1 }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <SkeletonLoader width="60px" height="14px" />
            <SkeletonLoader width="100px" height="16px" />
          </div>
        </div>
      </div>

      {/* Provider details section */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '16px'
      }}>
        {/* Account Number row */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <SkeletonLoader width="100px" height="14px" />
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <SkeletonLoader width="18px" height="18px" borderRadius="4px" />
            <SkeletonLoader width="80px" height="16px" />
          </div>
        </div>

        {/* Due Date row */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <SkeletonLoader width="70px" height="14px" />
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <SkeletonLoader width="18px" height="18px" borderRadius="4px" />
            <SkeletonLoader width="90px" height="16px" />
          </div>
        </div>

        {/* Contact Information row */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <SkeletonLoader width="18px" height="18px" borderRadius="4px" />
            <SkeletonLoader width="120px" height="16px" />
          </div>
          <SkeletonLoader width="80px" height="16px" />
        </div>
      </div>

      {/* Divider */}
      <div style={{
        width: '100%',
        height: '1px',
        backgroundColor: Colors.LIGHT_GREY,
        marginTop: '20px'
      }} />
    </div>
  );
};

export const PropertyDetailPageSkeleton: React.FC<{ isMobileApp?: boolean }> = ({ isMobileApp = false }) => {
  return (
    <div style={{
      position: 'relative',
      minHeight: '100vh',
      backgroundColor: 'transparent'
    }}>
      {/* Background gradient */}
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        width: '100%',
        height: '100%',
        backgroundImage: 'url(/pointed-gradient-background.svg)',
        backgroundSize: 'cover',
        backgroundPosition: 'top center',
        backgroundRepeat: 'no-repeat',
        zIndex: -1,
        pointerEvents: 'none'
      }} />

      <div style={{
        maxWidth: '800px',
        margin: '0 auto',
        width: '100%',
        padding: '0 20px',
        boxSizing: 'border-box'
      }}>
        {/* Header skeleton */}
        <PropertyDetailHeaderSkeleton />

        {/* Hex tile skeleton */}
        <PropertyDetailHexSkeleton isMobileApp={isMobileApp} />

        {/* Provider card skeleton */}
        <PropertyDetailProviderCardSkeleton />

        {/* Related files section skeleton */}
        <div style={{
          backgroundColor: Colors.WHITE,
          borderRadius: '12px',
          padding: '20px',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
        }}>
          <SkeletonLoader width="120px" height="18px" style={{ marginBottom: '16px' }} />
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {[1, 2, 3].map((index) => (
              <div key={index} style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '12px 0'
              }}>
                <SkeletonLoader width="24px" height="24px" borderRadius="4px" />
                <SkeletonLoader width="70%" height="16px" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// Edit Property Detail Page Skeleton Components
export const EditPropertyDetailFormSkeleton: React.FC = () => {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      gap: '20px',
      padding: '20px 0'
    }}>
      {/* Form fields */}
      {[1, 2, 3, 4, 5, 6].map((index) => (
        <div key={index} style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '8px'
        }}>
          <SkeletonLoader width="120px" height="16px" />
          <SkeletonLoader width="100%" height="48px" borderRadius="8px" />
        </div>
      ))}
    </div>
  );
};

export const EditPropertyDetailPageSkeleton: React.FC = () => {
  return (
    <div style={{
      position: 'relative',
      minHeight: '100vh',
      backgroundColor: Colors.WHITE,
      maxWidth: '600px',
      margin: '0 auto'
    }}>
      <div style={{
        padding: '0 20px',
        paddingBottom: '100px'
      }}>
        {/* Header skeleton */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '20px 0',
          marginBottom: '20px'
        }}>
          <SkeletonLoader width="24px" height="24px" borderRadius="4px" />
          <SkeletonLoader width="160px" height="18px" />
          <div style={{ width: '24px' }} />
        </div>

        {/* Form skeleton */}
        <EditPropertyDetailFormSkeleton />
      </div>

      {/* Save button skeleton */}
      <div style={{
        position: 'fixed',
        bottom: 0,
        left: '50%',
        transform: 'translateX(-50%)',
        width: '100%',
        maxWidth: '600px',
        padding: '20px',
        backgroundColor: Colors.WHITE,
        borderTop: `1px solid ${Colors.LIGHT_GREY}`
      }}>
        <SkeletonLoader
          width="100%"
          height="52px"
          borderRadius="8px"
        />
      </div>
    </div>
  );
};

// Member Detail Page Skeleton Components
export const MemberDetailHexagonSkeleton: React.FC = () => {
  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      margin: '20px 0 30px 0',
      position: 'relative',
      zIndex: 1,
    }}>
      <SkeletonLoader
        width="104px"
        height="120px"
        borderRadius="12px"
      />
    </div>
  );
};

export const MemberDetailInfoCardSkeleton: React.FC = () => {
  return (
    <div style={{
      backgroundColor: Colors.WHITE,
      borderRadius: '12px',
      padding: '20px',
      marginBottom: '20px',
      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
      width: '100%',
      boxSizing: 'border-box',
    }}>
      {/* Name Header */}
      <div style={{
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: '16px',
      }}>
        <SkeletonLoader
          width="150px"
          height="20px"
        />
      </div>

      {/* Contact Details */}
      <div style={{ marginBottom: '16px' }}>
        {/* 6 detail rows (Name, Account Type, Email, Phone, Birthday, etc.) */}
        {[1, 2, 3, 4, 5, 6].map((index) => (
          <div key={index} style={{
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'space-between',
            marginTop: '14px',
          }}>
            <SkeletonLoader
              width="80px"
              height="14px"
            />
            <SkeletonLoader
              width="120px"
              height="14px"
            />
          </div>
        ))}
      </div>

      {/* Action Buttons */}
      <div style={{
        display: 'flex',
        flexDirection: 'row',
        gap: '12px',
        marginTop: '20px',
      }}>
        <SkeletonLoader
          width="100px"
          height="40px"
          borderRadius="8px"
        />
        <SkeletonLoader
          width="100px"
          height="40px"
          borderRadius="8px"
        />
      </div>
    </div>
  );
};

export const MemberDetailPageSkeleton: React.FC = () => {
  return (
    <div className="contact-detail-container">
      {/* Page Header Skeleton */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '16px 20px',
        backgroundColor: Colors.WHITE,
        borderBottom: `1px solid ${Colors.LIGHT_GREY}`,
      }}>
        <SkeletonLoader
          width="60px"
          height="16px"
        />
        <SkeletonLoader
          width="100px"
          height="20px"
        />
        <SkeletonLoader
          width="60px"
          height="16px"
        />
      </div>

      {/* Main Content */}
      <div className="main-content-container">
        {/* Background gradient */}
        <div style={{
          position: 'absolute',
          top: '105px',
          left: 0,
          right: 0,
          width: '100%',
          height: '2995px',
          backgroundImage: 'url("/pointed-gradient-background.svg")',
          backgroundSize: 'cover',
          backgroundPosition: 'top center',
          backgroundRepeat: 'no-repeat',
          zIndex: 0,
        }} />

        {/* Content with padding */}
        <div className="content-with-padding">
          {/* Hexagon Avatar Skeleton */}
          <MemberDetailHexagonSkeleton />

          {/* Info Card Skeleton */}
          <MemberDetailInfoCardSkeleton />
        </div>
      </div>
    </div>
  );
};

export default SkeletonLoader;
