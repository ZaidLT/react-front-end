'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useRouter } from '../../hooks/useRouterWithPersistentParams';
import { useAuth } from '../../context/AuthContext';
import { useLanguageContext } from '../../context/LanguageContext';
import NavHeader from '../../components/NavHeader';
import TabBar from '../../components/TabBar';
import AddUserModal from '../../components/AddUserModal';
import LoadingSpinner from '../../components/LoadingSpinner';
import ObeliskBackgroundContainer from '../../components/ObeliskBackgroundContainer';
import HexagonGrid from '../../components/HexagonGrid';
import { HexContainer, HexButton, HexAvatarContent, HexIconContent, HexBackgroundType } from '../../components/hexagons';
import Icon from '../../components/Icon';

import { User } from '../../services/types';
import { Colors, Typography } from '../../styles';
import { getUsersByAccount } from '../../services/services';
import { useIsMobileApp } from '../../hooks/useMobileDetection';
import CustomText from '../../components/CustomText';
import './my-hive.css';

/**
 * AuthGuard - A component that ensures authentication is complete before rendering children
 */
const AuthGuard: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isLoading, isAuthenticated, router]);

  if (isLoading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        backgroundColor: Colors.WHITE
      }}>
        <LoadingSpinner />
      </div>
    );
  }

  if (!isAuthenticated || !user?.id) {
    return null;
  }

  return <>{children}</>;
};

/**
 * MyHiveContent - The actual content of the MyHive page
 * This component only renders when authentication is complete and we have a valid user
 */
const MyHiveContent: React.FC = () => {
  const { i18n } = useLanguageContext();
  const { user } = useAuth();
  const router = useRouter();
  const isMobileApp = useIsMobileApp();
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  // Fetch users for the account
  useEffect(() => {
    const fetchUsers = async () => {
      if (!user?.accountId) {
        console.error('No account ID available');
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);
        const fetchedUsers = await getUsersByAccount(user.accountId);

        // Filter active users (including passive members) and sort current user first
        const activeUsers = fetchedUsers.filter(u =>
          u.ActiveUser && !u.Deleted
        );

        const sortedUsers = activeUsers.sort((a) =>
          a.UniqueId === user.id ? -1 : 1
        );

        // Log the processed users for debugging
        console.log('=== PROCESSED USERS FOR MY-HIVE ===');
        sortedUsers.forEach((user, index) => {
          console.log(`Processed User ${index + 1}:`, {
            UniqueId: user.UniqueId,
            FirstName: user.FirstName,
            LastName: user.LastName,
            AvatarImagePath: user.AvatarImagePath,
            AvatarImagePathExists: !!user.AvatarImagePath,
            AvatarImagePathType: typeof user.AvatarImagePath,
            AvatarImagePathValue: user.AvatarImagePath
          });
        });
        console.log('=== END PROCESSED USERS ===');

        setUsers(sortedUsers);
      } catch (error) {
        console.error('Error fetching users:', error);
        setError('Failed to load hive members. Please try again.');
      } finally {
        setIsLoading(false);
        setIsInitialLoad(false);
      }
    };

    fetchUsers();
  }, [user?.accountId, user?.id]);

  const handleUserClick = useCallback((selectedUser: User) => {
    // Navigate to the member detail page with the user's ID
    router.push(`/my-hive/member/${selectedUser.UniqueId}`);
  }, [router]);

  const handleAddUser = useCallback(() => {
    setShowAddUserModal(true);
  }, []);

  const handleUserCreated = async () => {
    // Refresh the user list after a new user is created
    if (user?.accountId) {
      try {
        setError(null);
        const fetchedUsers = await getUsersByAccount(user.accountId);

        // Filter active users (including passive members) and sort current user first
        const activeUsers = fetchedUsers.filter(u =>
          u.ActiveUser && !u.Deleted
        );

        const sortedUsers = activeUsers.sort((a) =>
          a.UniqueId === user.id ? -1 : 1
        );

        setUsers(sortedUsers);
      } catch (error) {
        console.error('Error refreshing users:', error);
        setError('Failed to refresh hive members.');
      }
    }
  };

  // Render hexagons directly (no wrapper array needed for new HexagonGrid)
  const hexagons = useMemo(() => {
    return [
      ...users.map((user) => (
        <HexButton key={user.UniqueId} onClick={() => handleUserClick(user)}>
          <HexAvatarContent
            user={{
              id: user.UniqueId,
              firstName: user.FirstName,
              lastName: user.LastName,
              avatarUrl: user.AvatarImagePath,
            }}
          />
        </HexButton>
      )),
      // Add button
      <HexButton key="add-user" onClick={handleAddUser}>
        <HexIconContent
          iconName="plus"
          label={i18n.t('Add') || 'Add'}
        />
      </HexButton>
    ];
  }, [users, handleUserClick, handleAddUser, i18n]);

  if (isLoading || isInitialLoad) {
    return (
      <div className="my-hive-page-container">
        <div className="my-hive-page-background" />
        <div className="my-hive-content-container" />
        <TabBar />
      </div>
    );
  }

  return (
    <>
    <div className="my-hive-page-container">
      {/* Background */}
      <div className="my-hive-page-background" />
      
      {/* Top Navigation */}
      <div className="nav-header">
        <NavHeader
          headerText={i18n.t('MyHive')}
          left={{
            goBack: true,
            onPress: () => router.push('/home')
          }}
          right={[{
            key: "search",
            icon: <Icon name="search" width={24} height={24} color={Colors.BLUE} />,
            onPress: () => router.push('/search?from=my-hive')
          }]}
        />
      </div>

      {/* Main Content */}
      <div className="my-hive-content">
        <div className="my-hive-content-container">
          
          {/* Error Message */}
          {error && (
            <div className="my-hive-error">
              <p>{error}</p>
              <button
                onClick={() => window.location.reload()}
                className="my-hive-retry-btn"
              >
                Retry
              </button>
            </div>
          )}
          
          {/* Central Hive Icon */}
          <div className="my-hive-central-icon">
            <HexContainer background={HexBackgroundType.Gradient}>
              <HexIconContent iconName="family" iconColor={Colors.BLUE} />
            </HexContainer>
          </div>

        </div>
      </div>

      {/* Users Hex Tiles using HexagonGrid - Full width, breaks out of container */}
      <div style={{
        marginTop: '-12px',
        width: '100vw',
        position: 'relative',
        left: '50%',
        right: '50%',
        marginLeft: '-50vw',
        marginRight: '-50vw',
      }}>
        {users.length === 0 && !error && !isLoading ? (
          <div
            style={{
              textAlign: 'center',
              padding: '40px 0',
              width: '100%',
            }}
          >
            <CustomText style={{ color: Colors.DARK_GREY }}>
              {i18n.t('NoHiveMembersFound')}
            </CustomText>
          </div>
        ) : (
          <ObeliskBackgroundContainer>
            <div className="my-hive-hexagon-grid-content">
              <HexagonGrid
                tilesPerRow={[2, 3, 2]}
              >
                {hexagons}
              </HexagonGrid>
            </div>
          </ObeliskBackgroundContainer>
        )}
      </div>

      {/* Add User Modal */}
      <AddUserModal
        isVisible={showAddUserModal}
        onClose={() => setShowAddUserModal(false)}
        onUserCreated={handleUserCreated}
      />
    </div>

    {/* Tab Bar - Outside constrained container to span full width */}
    <TabBar />
    </>
  );
};

/**
 * MyHivePage - The main component that wraps MyHiveContent with AuthGuard
 * This ensures authentication is complete before rendering any content
 */
const MyHivePage: React.FC = () => {
  return (
    <AuthGuard>
      <MyHiveContent />
    </AuthGuard>
  );
};

export default MyHivePage;
