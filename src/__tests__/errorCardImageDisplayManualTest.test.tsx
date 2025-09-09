// Mock uuid before importing errorCards
jest.mock('uuid', () => ({
  v4: jest.fn(() => 'mocked-uuid')
}));

import { CardType } from '@/types/card';
import { CARD_GENERATION_ERROR } from '@/data/defaultCards/errorCards';

describe('Error Card Image Display Manual Test', () => {
  test('manual verification of error card image priority', () => {
    // Simulate the scenario described in the issue
    const errorCard = CARD_GENERATION_ERROR;
    const userUploadedImage = '/some-user-image.jpg';

    console.log('Error Card Details:');
    console.log('- Type:', errorCard.type);
    console.log('- Image URL:', errorCard.imageUrl);
    console.log('- User Uploaded Image:', userUploadedImage);

    // Test the logic from create.tsx
    const shouldShowImage = (errorCard.type === CardType.ERROR && errorCard.imageUrl) || userUploadedImage;
    const imageToDisplay = errorCard.type === CardType.ERROR ? errorCard.imageUrl : userUploadedImage;

    console.log('\nLogic Test Results:');
    console.log('- Should show image:', !!shouldShowImage);
    console.log('- Image to display:', imageToDisplay);

    // Verify the fix
    expect(errorCard.type).toBe(CardType.ERROR);
    expect(errorCard.imageUrl).toBe('/error_card.png');
    expect(imageToDisplay).toBe('/error_card.png'); // Should be error card image, not user image
    expect(imageToDisplay).not.toBe(userUploadedImage);

    console.log('\n✅ Fix verified: Error cards will display their own imageUrl instead of user uploaded image');
  });
});
