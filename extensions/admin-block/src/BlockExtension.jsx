import {
  reactExtension,
  useApi,
  AdminBlock,
  BlockStack,
  TextField,
  Button,
  InlineStack,
  Banner,
} from '@shopify/ui-extensions-react/admin';
import { useState, useEffect } from 'react';
import { getMetafields, updateMetafields } from './utils';

const TARGET = 'admin.product-details.block.render';

export default reactExtension(TARGET, () => <App />);

function App() {
  const { i18n, data } = useApi(TARGET);
  const [width, setWidth] = useState('');
  const [height, setHeight] = useState('');
  const [length, setLength] = useState('');
  const [quantity, setQuantity] = useState('');
  const [metafieldValue, setMetafieldValue] = useState('');
  const [loading, setLoading] = useState(false);
  const productId = data?.selected[0]?.id;
  const [bannerMessage, setBannerMessage] = useState('');
  const [bannerStatus, setBannerStatus] = useState('info');

  useEffect(() => {
    if (productId) {
      loadMetafields();
    }
  }, [productId]);

  const loadMetafields = async () => {
    try {
      const productData = await getMetafields(productId);

      if (productData?.data?.product?.metafield?.value) {
        const parsedData = JSON.parse(productData.data.product.metafield.value);

        setWidth(parsedData.width || '');
        setHeight(parsedData.height || '');
        setLength(parsedData.length || '');
        setQuantity(parsedData.quantity || '');
        setMetafieldValue(productData.data.product.metafield.value);
      }
    } catch (error) {
      console.error('Error loading metafields:', error);
    }
  };

  const handleSave = async () => {
    setLoading(true);
    setBannerMessage('');

    try {
      const formData = {
        width,
        height,
        length,
        quantity
      };

      const result = await updateMetafields(productId, formData);

      if (result.data?.metafieldsSet?.userErrors?.length === 0) {
        setMetafieldValue(JSON.stringify(formData));
        console.log('Metafields saved successfully');

        setBannerMessage('The data has been saved successfully! Please refresh the page.');
        setBannerStatus('success');
      } else {
        console.error('Error saving metafields:', result.data?.metafieldsSet?.userErrors);
        setBannerStatus('critical');
      }
    } catch (error) {
      console.error('Error saving metafields:', error);
      setBannerStatus('critical');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminBlock title="Package Replacements">
      <BlockStack spacing="base">
        {bannerMessage && (
          <InlineStack spacing="tight" inlineAlignment="start" paddingBlockStart="base" paddingBlockEnd="base">
            <Banner status={bannerStatus}>
              {bannerMessage}
            </Banner>
          </InlineStack>
        )}
        <TextField
          label="Width"
          value={width}
          onChange={setWidth}
          type="number"
        />
        <TextField
          label="Height"
          value={height}
          onChange={setHeight}
          type="number"
        />
        <TextField
          label="Length"
          value={length}
          onChange={setLength}
          type="number"
        />
        <TextField
          label="Quantity"
          value={quantity}
          onChange={setQuantity}
          type="number"
        />
        <InlineStack spacing="tight" inlineAlignment="start" paddingBlockStart="base">
          <Button
            onPress={handleSave}
            variant="primary"
            loading={loading}
          >
            Save
          </Button>
        </InlineStack>
      </BlockStack>
    </AdminBlock>
  );
}
