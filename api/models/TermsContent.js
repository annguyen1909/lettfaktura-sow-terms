const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const TermsContent = sequelize.define('TermsContent', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    language_code: {
      type: DataTypes.STRING(2),
      allowNull: false
    },
    heading: {
      type: DataTypes.STRING,
      allowNull: true
    },
    close_button_text: {
      type: DataTypes.STRING,
      allowNull: true
    },
    // Terms content fields
    terms_text_1: DataTypes.TEXT,
    terms_text_2: DataTypes.TEXT,
    terms_text_3: DataTypes.TEXT,
    terms_text_4: DataTypes.TEXT,
    terms_text_5: DataTypes.TEXT,
    terms_text_6: DataTypes.TEXT,
    terms_text_7: DataTypes.TEXT,
    terms_text_8: DataTypes.TEXT,
    terms_text_9: DataTypes.TEXT,
    terms_text_10: DataTypes.TEXT,
    terms_text_11: DataTypes.TEXT,
    terms_text_12: DataTypes.TEXT,
    terms_text_13: DataTypes.TEXT,
    terms_text_14: DataTypes.TEXT,
    terms_text_15: DataTypes.TEXT,
    terms_text_16: DataTypes.TEXT,
    terms_text_17: DataTypes.TEXT,
    terms_text_18: DataTypes.TEXT,
    terms_text_19: DataTypes.TEXT,
    terms_text_20: DataTypes.TEXT,
    terms_text_21: DataTypes.TEXT,
    terms_text_22: DataTypes.TEXT,
    terms_text_23: DataTypes.TEXT,
    terms_text_24: DataTypes.TEXT,
    // Special Swedish field
    terms_text_10_se: DataTypes.TEXT
  }, {
    tableName: 'terms_content',
    timestamps: false
  });

  return TermsContent;
};
