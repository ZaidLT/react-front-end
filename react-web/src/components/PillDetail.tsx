import React, { useEffect, useState, useCallback } from "react";
// Colors is used in JSX
import FilterPills from "./FilterPills";
import { useLanguageContext } from "../context/LanguageContext";
import { useAuth } from "../context/AuthContext";
import { BucketType, IFilterPill, INestedTile } from "../util/types";
import { FILTER_PILLS } from "../util/constants";
import PillDetailsTask from "./PillDetailsTask";
import PillDetailDocs from "./PillDetailDocs";
import PillDetailsNote from "./PillDetailsNote";
import PillDetailEvent from "./PillDetailEvent";
import { IContact, User, IEEvent, ITTask, INote } from "../services/types";
import AddDocumentModal from "./AddDocumentModal";
import DocumentUploadModal from "./DocumentUploadModal";
import { useRouter } from "next/navigation";
import {
  useTileStore,
  useFileStore,
  useOverlayStore,
  useUserStore,
  useTileFileStore,
  useMemberFileStore
} from "../context/store";
import { findTileByUniqueId, emitSnackbar } from "../util/helpers";
import moment from "moment";
import { v4 as uuidv4 } from "uuid";
import {
  createFile,
  createMemberFile,
  createTileFile,
  getFilesByUser,
  getMemberFilesByUser,
  getTileFilesByUser,
  uploadFile,
  getContactDents,
  getTileDents,
  getUserDents,
  getContentTypesFromPill
} from "../services/services";
import { DentsResponse, FileWithBlacklist } from "../services/dentsService";
import CustomText from "./CustomText";

interface PillDetailProps {
  homeMemberId: string; // For backward compatibility - can be tileId, contactId, or userId
  contactInfo?: IContact;
  entityType?: 'contact' | 'tile' | 'user'; // Optional: specify the entity type explicitly
  firstName?: string; // Optional contextual names for deeplinks
  lastName?: string;
}

/**
 * PillDetail - A component for displaying details about a tile or contact
 *
 * This component shows tasks, notes, documents, and events related to a tile
 * or contact. It allows filtering between these different types of content.
 *
 * @param homeMemberId - The ID of the tile or contact (for backward compatibility)
 * @param contactInfo - Optional contact information
 */
const PillDetail: React.FC<PillDetailProps> = ({
  homeMemberId,
  contactInfo,
  entityType,
  firstName,
  lastName,
}) => {
  const { i18n } = useLanguageContext();
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const router = useRouter();
  const { user: authUser } = useAuth();
  const user = useUserStore((state) => state.user);
  const updateOverlay = useOverlayStore((state) => state.updateOverlay);
  const tiles = useTileStore((state) => state.tiles);

  const [showAddDocumentViewModal, setShowDocumentViewModal] = useState<boolean>(false);
  const [showRenameDocumentModal, setShowRenameDocumentModal] = useState<boolean>(false);
  const [tile, setTile] = useState<INestedTile>();
  const [file, setFile] = useState<File | undefined>();
  // Used by FilterPills component
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [selectedItem, setSelectedItem] = useState<string | null>(null);
  const [filterPills, setFilterPills] = useState<IFilterPill[]>(FILTER_PILLS);

  // DENTS data state
  const [dentsData, setDentsData] = useState<DentsResponse | null>(null);
  const [isDentsLoading, setIsDentsLoading] = useState<boolean>(false);
  const [dentsError, setDentsError] = useState<string | null>(null);

  const onFilterPillSelected = (pill: IFilterPill) => {
    const updatedPills = filterPills.map((filterPill) => {
      if (filterPill.text === pill.text) {
        return { ...filterPill, isSelected: true };
      } else {
        return { ...filterPill, isSelected: false };
      }
    });
    setFilterPills(updatedPills);
  };

  const handleSetFile = (file: File | undefined) => {
    setFile(file);
    setShowDocumentViewModal(false);
    setTimeout(() => {
      setShowRenameDocumentModal(true);
    }, 500); // Added a delay for smooth transition of modals
  };

  const uploadDoc = async (name: string) => {
    setShowRenameDocumentModal(false);
    updateOverlay({
      ...useOverlayStore.getState().overlay,
      isLoading: true,
    });

    try {
      if (file) {
        const selectedHive = findTileByUniqueId(tiles, homeMemberId);

        // Upload the file to storage
        const uploadResponse = await uploadFile(
          BucketType.UserTileFiles,
          file,
          name || file.name,
          `${user.UniqueId}/${selectedHive?.UniqueId}`
        );

        // Create file record
        const createFileResponse = await createFile({
          Account_uniqueId: user.Account_uniqueId,
          User_uniqueId: user.UniqueId,
          Active: true,
          CreationTimestamp: moment().toISOString(),
          Deleted: false,
          Filename: name || file.name,
          StorageProviderUniqueId: uuidv4(),
          UniqueId: uuidv4(),
          UpdateTimestamp: moment().toISOString(),
          FileURL: uploadResponse?.url!,
        });

        // Refresh files list
        const getFilesByUserResponse = await getFilesByUser(user.UniqueId, user.Account_uniqueId);
        useFileStore.setState({
          files: getFilesByUserResponse,
        });

        if ((hive as User)?.FirstName) {
          // Handle user file
          const createMemberFileResponse = await createMemberFile({
            UniqueId: uuidv4(),
            User_uniqueId: user.UniqueId,
            CreationTimestamp: moment().toISOString(),
            UpdateTimestamp: moment().toISOString(),
            Active: true,
            Deleted: false,
            Account_uniqueId: user.Account_uniqueId,
            File_UniqueId: createFileResponse.UniqueId,
            AffectedUser_UniqueId:
              contactInfo?.Invited_User_uniqueId || (hive as User).UniqueId,
          });

          // Refresh member files list
          const getMemberFilesByUserResponse = await getMemberFilesByUser();
          useMemberFileStore.setState({
            memberFiles: getMemberFilesByUserResponse,
          });

          if (createMemberFileResponse) {
            emitSnackbar({
              message: <CustomText>{`${i18n.t("FileSavedSuccessfully")}`}</CustomText>,
              duration: 3000,
              type: "success",
            });
          }
        } else {
          // Handle tile file
          const createTileFileResponse = await createTileFile({
            Account_uniqueId: user.Account_uniqueId,
            User_uniqueId: user.UniqueId,
            Active: true,
            CreationTimestamp: moment().toISOString(),
            Deleted: false,
            File_UniqueId: createFileResponse.UniqueId,
            HomeMember_UniqueId: hive?.UniqueId ?? "",
            UniqueId: uuidv4(),
            UpdateTimestamp: moment().toISOString(),
          });

          // Refresh tile files list
          const getTileFilesByUserResponse = await getTileFilesByUser();
          useTileFileStore.setState({
            tileFiles: getTileFilesByUserResponse,
          });

          if (createTileFileResponse) {
            emitSnackbar({
              message: <CustomText>{`${i18n.t("FileSavedSuccessfully")}`}</CustomText>,
              duration: 3000,
              type: "success",
            });
          }
        }
      }
    } catch (error) {
      emitSnackbar({
        message: <CustomText>{i18n.t("SomethingWentWrongTryAgainLater")}</CustomText>,
        duration: 3000,
        type: "error",
      });
    } finally {
      updateOverlay({
        ...useOverlayStore.getState().overlay,
        isLoading: false,
      });
    }
  };

  // Fetch DENTS data for the contact or tile
  const fetchDentsData = useCallback(async () => {
    // Use auth user data first, fall back to store user data
    const currentUser = authUser || user;

    if (!currentUser?.id || !currentUser?.accountId) {
      if (process.env.NEXT_PUBLIC_DEBUG_MODE === 'true') {
        console.log('[PILL_DETAIL] User data not available, skipping DENTS fetch', {
          authUser,
          user,
          currentUser
        });
      }
      return;
    }

    if (process.env.NEXT_PUBLIC_DEBUG_MODE === 'true') {
      console.log('[PILL_DETAIL] Starting DENTS fetch:', {
        contactId: contactInfo?.UniqueId,
        homeMemberId,
        userId: currentUser.id,
        accountId: currentUser.accountId
      });
    }

    setIsDentsLoading(true);
    setDentsError(null);

    try {
      let dentsResponse: DentsResponse;

      if (contactInfo?.UniqueId) {
        // Fetch DENTS for contact
        dentsResponse = await getContactDents(contactInfo.UniqueId, {
          accountId: currentUser.accountId,
          userId: currentUser.id,
          includeDeleted: false
        });
      } else if (homeMemberId) {
        // Determine entity type and fetch appropriate DENTS
        if (entityType === 'user') {
          // Fetch DENTS for user (hive member)
          dentsResponse = await getUserDents(homeMemberId, {
            accountId: currentUser.accountId,
            userId: currentUser.id,
            includeDeleted: false
          });
        } else {
          // Default to tile DENTS (homeMemberId parameter contains tileId for tile pages)
          dentsResponse = await getTileDents(homeMemberId, {
            accountId: currentUser.accountId,
            userId: currentUser.id,
            includeDeleted: false
          });
        }
      } else {
        throw new Error('No contact, tile, or user ID provided');
      }

      setDentsData(dentsResponse);

      // Update filter pills with counts
      setFilterPills(prevPills => prevPills.map((pill) => {
        let count = 0;
        switch (pill.text.toLowerCase()) {
          case 'tasks':
            count = dentsResponse.counts.tasks || 0;
            break;
          case 'notes':
            count = dentsResponse.counts.notes || 0;
            break;
          case 'docs':
            count = dentsResponse.counts.files || 0;
            break;
          case 'events':
            count = dentsResponse.counts.events || 0;
            break;
        }
        return { ...pill, count };
      }));

      if (process.env.NEXT_PUBLIC_DEBUG_MODE === 'true') {
        console.log('[PILL_DETAIL] DENTS data fetched successfully:', {
          entityType: dentsResponse.entityType,
          entityId: dentsResponse.entityId,
          counts: dentsResponse.counts
        });
      }

    } catch (error) {
      console.error('[PILL_DETAIL] Error fetching DENTS data:', error);
      setDentsError(error instanceof Error ? error.message : 'Failed to load data');
    } finally {
      setIsDentsLoading(false);
    }
  }, [authUser?.id, authUser?.accountId, user?.UniqueId, user?.Account_uniqueId, contactInfo?.UniqueId, homeMemberId]);

  useEffect(() => {
    let foundTile = findTileByUniqueId(tiles, homeMemberId);
    if (foundTile) {
      setTile(foundTile);
    }
  }, [tiles, homeMemberId]);

  // Fetch DENTS data when component mounts or dependencies change
  useEffect(() => {
    fetchDentsData();
  }, [fetchDentsData]);

  // Ensure hive has the correct type for DocumentUploadModal
  let hive: INestedTile | IContact | User = tile
    ? tile
    : contactInfo
      ? contactInfo
      : user as unknown as User;

  return (
    <>
      <div style={{ marginBottom: '16px' }}>
        <FilterPills
          pills={filterPills}
          onPillSelected={onFilterPillSelected}
          leftOffset={0}
          rightOffset={0}
          setSelectedItemProp={setSelectedItem}
        />
      </div>

      {/* Show error state if DENTS fetch failed */}
      {dentsError && (
        <div style={{
          padding: '20px',
          textAlign: 'center',
          backgroundColor: '#ffebee',
          borderRadius: '8px',
          margin: '10px 0'
        }}>
          <CustomText style={{ color: '#d32f2f' }}>
            Failed to load data: {dentsError}
          </CustomText>
        </div>
      )}

      {filterPills[0].isSelected && (
        <PillDetailsTask
          memberId={homeMemberId}
          entityType={entityType}
          dentsData={dentsData?.dents?.tasks}
          isLoading={isDentsLoading}
          firstName={firstName}
          lastName={lastName}
        />
      )}

      {filterPills[2].isSelected && (
        <PillDetailDocs
          homeMemberId={homeMemberId}
          entityType={entityType}
          addFilePressed={() => {
            setShowDocumentViewModal(true);
          }}
          dentsData={dentsData?.dents?.files}
          isLoading={isDentsLoading}
          firstName={firstName}
          lastName={lastName}
        />
      )}

      {filterPills[1].isSelected && (
        <PillDetailsNote
          memberId={homeMemberId}
          entityType={entityType}
          dentsData={dentsData?.dents?.notes}
          isLoading={isDentsLoading}
          firstName={firstName}
          lastName={lastName}
        />
      )}

      {filterPills[3].isSelected && (
        <PillDetailEvent
          tile={tile}
          memberId={homeMemberId}
          entityType={entityType}
          dentsData={dentsData?.dents?.events}
          isLoading={isDentsLoading}
          firstName={firstName}
          lastName={lastName}
        />
      )}

      {showRenameDocumentModal && (
        <DocumentUploadModal
          clickCancel={() => {
            setShowRenameDocumentModal(false);
          }}
          isVisible={showRenameDocumentModal}
          onRequestClose={() => {
            setShowRenameDocumentModal(false);
          }}
          hive={hive}
          uploadDoc={uploadDoc}
          file={file}
          hiveFromScreen="space-details"
        />
      )}

      {showAddDocumentViewModal && (
        <AddDocumentModal
          isVisible={showAddDocumentViewModal}
          setFile={handleSetFile}
          onRequestClose={() => {
            setShowDocumentViewModal(false);
          }}
        />
      )}
    </>
  );
};

export default PillDetail;
