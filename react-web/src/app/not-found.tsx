'use client';

import React, { Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import NavHeader from '../components/NavHeader';
import CustomText from '../components/CustomText';
import { Colors, Typography } from '../styles';
import { useLanguageContext } from '../context/LanguageContext';

const NotFoundContent: React.FC = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { i18n } = useLanguageContext();

  const returnTo = searchParams.get('returnTo');

  return (
    <div style={{ minHeight: '100vh', backgroundColor: Colors.WHITE }}>
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        <NavHeader headerText={i18n.t('NotFound') || 'Not Found'} left={{ goBack: true, onPress: () => returnTo ? router.push(returnTo) : router.back() }} />
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: 40, gap: 12 }}>
        <CustomText style={{ fontFamily: Typography.FONT_FAMILY_POPPINS_SEMIBOLD, fontSize: Typography.FONT_SIZE_20, color: Colors.MIDNIGHT }}>
          {i18n.t('PageNotFound') || 'Page not found'}
        </CustomText>
        <CustomText style={{ color: Colors.GREY_COLOR }}>
          {i18n.t('LoadingEllipsis')}
        </CustomText>
      </div>
    </div>
  );
};

const NotFoundPage: React.FC = () => {
  const { i18n } = useLanguageContext();
  return (
    <Suspense fallback={
      <div style={{ minHeight: '100vh', backgroundColor: Colors.WHITE, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <CustomText>{i18n.t('LoadingEllipsis') || 'Loading...'}</CustomText>
      </div>
    }>
      <NotFoundContent />
    </Suspense>
  );
};

export default NotFoundPage;

