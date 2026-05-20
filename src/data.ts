/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { School, SubjectData } from "./types";

const createMockPaper = (id: string, title: string, content: string): any => ({
  id,
  title,
  year: 2023,
  url: "#",
  content: content || `This is the mock content for ${title}. It contains various questions and sections relevant to the subject.`,
});

const grade9Subjects: SubjectData[] = [
  { 
    name: "Math", 
    periodical: [], 
    topical: [
      createMockPaper("g9-m-u1", "Unit 1: Further on sets", "Sets, operations on sets, and Venn diagrams."),
      createMockPaper("g9-m-u2", "Unit 2: The number system", "Rational and irrational numbers, real number system."),
      createMockPaper("g9-m-u3", "Unit 3: Solving equations", "Linear equations and their applications."),
      createMockPaper("g9-m-u4", "Unit 4: Solving inequalities", "Linear inequalities and graphical solutions."),
      createMockPaper("g9-m-u5", "Unit 5: Introduction to trigonometry", "Trigonometric ratios and right-angled triangles."),
      createMockPaper("g9-m-u6", "Unit 6: Regular polygons", "Properties of polygons and interior/exterior angles."),
      createMockPaper("g9-m-u7", "Unit 7: Congruency and similarity", "Triangles, similarity criteria, and geometric proofs."),
      createMockPaper("g9-m-u8", "Unit 8: Vectors in two dimensions", "Vector addition, subtraction, and magnitude."),
      createMockPaper("g9-m-u9", "Unit 9: Statistics and probability", "Data collection, presentation, and basic probability."),
    ] 
  },
  { 
    name: "Physics", 
    periodical: [], 
    topical: [
      createMockPaper("g9-p-u1", "Unit 1: Physics and Human Society", "Evolution of physics and its impact on society."),
      createMockPaper("g9-p-u2", "Unit 2: Physical Quantities", "Measurements, units, and scientific notation."),
      createMockPaper("g9-p-u3", "Unit 3: Motion in a Straight Line", "Velocity, acceleration, and motion graphs."),
      createMockPaper("g9-p-u4", "Unit 4: Force, Work, Energy, and Power", "Newton's laws, energy forms, and work-energy theorem."),
      createMockPaper("g9-p-u5", "Unit 5: Simple Machines", "Levers, pulleys, and mechanical advantage."),
      createMockPaper("g9-p-u6", "Unit 6: Mechanical Oscillation and Sound Wave", "Vibrations, wave properties, and sound phenomena."),
      createMockPaper("g9-p-u7", "Unit 7: Temperature and Thermometer", "Thermal expansion, scales, and heat transfer."),
    ] 
  },
  { 
    name: "Biology", 
    periodical: [], 
    topical: [
      createMockPaper("g9-b-u1", "Unit 1: Introduction to Biology", "Branches of biology and scientific methods."),
      createMockPaper("g9-b-u2", "Unit 2: Characteristics and Classification of Organisms", "Taxonomy and biodiversity."),
      createMockPaper("g9-b-u3", "Unit 3: Cells", "Cell structure, organelles, and functions."),
      createMockPaper("g9-b-u4", "Unit 4: Reproduction", "Asexual and sexual reproduction in plants and animals."),
      createMockPaper("g9-b-u5", "Unit 5: Human Health, Nutrition, and Disease", "Healthy diet, infectious and non-infectious diseases."),
      createMockPaper("g9-b-u6", "Unit 6: Ecology", "Ecosystems, food chains, and environmental conservation."),
    ] 
  },
  { 
    name: "Chemistry", 
    periodical: [], 
    topical: [
      createMockPaper("g9-c-u1", "Unit 1: Chemistry And Its Importance", "Role of chemistry in industry and medicine."),
      createMockPaper("g9-c-u2", "Unit 2: Measurements And Scientific Methods", "Precision, accuracy, and lab safety."),
      createMockPaper("g9-c-u3", "Unit 3: Structure Of The Atom", "Subatomic particles and atomic models."),
      createMockPaper("g9-c-u4", "Unit 4: Periodic Classification Of Elements", "Periodic table trends and history."),
      createMockPaper("g9-c-u5", "Unit 5: Chemical Bonding", "Ionic, covalent, and metallic bonds."),
    ] 
  },
  { 
    name: "Economics", 
    periodical: [], 
    topical: [
      createMockPaper("g9-e-u1", "Unit 1: Introducing Economics", "Scarcity, choice, and economic systems."),
      createMockPaper("g9-e-u2", "Unit 2: The Basic Economic Problems and Economic Systems", "Production possibility frontier."),
      createMockPaper("g9-e-u3", "Unit 3: Economic Resources and Markets", "Factors of production and market tipos."),
      createMockPaper("g9-e-u4", "Unit 4: Introduction to Demand and Supply", "Market equilibrium and price determination."),
      createMockPaper("g9-e-u5", "Unit 5: Introduction to Production and Cost", "Short-run production and cost curves."),
      createMockPaper("g9-e-u6", "Unit 6: Introduction to Money", "Functions of money and banking basics."),
      createMockPaper("g9-e-u7", "Unit 7: Introduction to Macroeconomics", "Aggregrate variables and national income."),
      createMockPaper("g9-e-u8", "Unit 8: Basic Entrepreneurship", "Business ideas, planning, and management."),
    ] 
  },
  { 
    name: "Geography", 
    periodical: [], 
    topical: [
      createMockPaper("g9-g-u1", "Unit 1: Geological History And Topography Of Ethiopia", "Rock types and relief features."),
      createMockPaper("g9-g-u2", "Unit 2: Climate Of Ethiopia", "Temperature and rainfall patterns."),
      createMockPaper("g9-g-u3", "Unit 3: Natural Resource Base Of Ethiopia", "Soil, water, and forests."),
      createMockPaper("g9-g-u4", "Unit 4: Population And Demographic Characteristics Of Ethiopia", "Distribution and growth."),
      createMockPaper("g9-g-u5", "Unit 5: Major Economic And Cultural Activities In Ethiopia", "Agriculture and tourism."),
      createMockPaper("g9-g-u6", "Unit 6: Human – Natural Environment Interactions In Ethiopia", "Environmental challenges."),
      createMockPaper("g9-g-u7", "Unit 7: Contemporary Geographic Issues and Public Concerns In Ethiopia", "Urbanization and health."),
      createMockPaper("g9-g-u8", "Unit 8: Geographic Inquiry Skills And Techniques", "Map reading and field work."),
    ] 
  },
  { 
    name: "History", 
    periodical: [], 
    topical: [
      createMockPaper("g9-h-u1", "Unit 1: The Discipline of History and Human Evolution", "Sources of history and early humans."),
      createMockPaper("g9-h-u2", "Unit 2: Ancient World Civilizations up to c. 500 AD", "Egypt, Mesopotamia, and Aksum."),
      createMockPaper("g9-h-u3", "Unit 3: Peoples and States in Ethiopia and the Horn to the End of 13th Century", "Zagwe dynasty and medieval kingdoms."),
      createMockPaper("g9-h-u4", "Unit 4: The Middle Ages and Early Modern World, C. 500 to 1750s", "Feudalism and the Renaissance."),
      createMockPaper("g9-h-u5", "Unit 5: Peoples and States of Africa to 1500", "Bantu expansion and West African empires."),
      createMockPaper("g9-h-u6", "Unit 6: Africa and the Outside World 1500- 1880s", "Slave trade and initial contacts."),
      createMockPaper("g9-h-u7", "Unit 7: States, Principalities, Population Movements & Interactions in Ethiopia 13th to Mid-16th C.", "Conflict and migration."),
      createMockPaper("g9-h-u8", "Unit 8: Political, Social, and Economic Processes in Ethiopia Mid-16th to Mid-19th C.", "Gonderine period and Zemene Mesafint."),
      createMockPaper("g9-h-u9", "Unit 9: The Age of Revolutions 1750s to 1815", "American and French revolutions."),
    ] 
  },
  { name: "English", periodical: [], topical: [createMockPaper("g9-en-u1", "Unit 1: Basic Communication", "Daily routines, family, and hobbies.")] },
];

const grade10Subjects: SubjectData[] = [
  { 
    name: "Math", 
    periodical: [], 
    topical: [
      createMockPaper("g10-m-u1", "Unit 1: Relations and Functions", "Domain, range, and types of functions."),
      createMockPaper("g10-m-u2", "Unit 2: Polynomial Functions", "Zeros, graphs, and division of polynomials."),
      createMockPaper("g10-m-u3", "Unit 3: Exponential and Logarithmic Functions", "Base e, natural logs, and equations."),
      createMockPaper("g10-m-u4", "Unit 4: Trigonometric Functions", "Unit circle and periodic graphs."),
      createMockPaper("g10-m-u5", "Unit 5: Circles", "Tangent lines and chord properties."),
      createMockPaper("g10-m-u6", "Unit 6: Solid Figures", "Volume and surface area of complex solids."),
      createMockPaper("g10-m-u7", "Unit 7: Coordinate Geometry", "Distance formula and line equations."),
    ] 
  },
  { 
    name: "Physics", 
    periodical: [], 
    topical: [
      createMockPaper("g10-p-u1", "Unit 1: Vector Quantities", "Components and resultant vectors."),
      createMockPaper("g10-p-u2", "Unit 2: Uniformly Accelerated Motion", "Free fall and kinematics."),
      createMockPaper("g10-p-u3", "Unit 3: Elasticity and Static Equilibrium of Rigid Body", "Stress, strain, and torque."),
      createMockPaper("g10-p-u4", "Unit 4: Static and Current Electricity", "Coulomb's law and Ohm's law."),
      createMockPaper("g10-p-u5", "Unit 5: Magnetism", "Magnetic force and induction."),
      createMockPaper("g10-p-u6", "Unit 6: Electromagnetic Waves and Geometrical Optics", "Reflection, refraction, and lenses."),
    ] 
  },
  { 
    name: "Biology", 
    periodical: [], 
    topical: [
      createMockPaper("g10-b-u1", "Unit 1: Sub-fields of Biology", "Genetics, embryology, and paleontology."),
      createMockPaper("g10-b-u2", "Unit 2: Plants", "Plant anatomy and physiology."),
      createMockPaper("g10-b-u3", "Unit 3: Biochemical molecules", "Proteins, lipids, and nucleic acids."),
      createMockPaper("g10-b-u4", "Unit 4: Cell reproduction", "Mitosis and meiosis."),
      createMockPaper("g10-b-u5", "Unit 5: Human Biology", "Digestive and circulatory systems."),
      createMockPaper("g10-b-u6", "Unit 6: Ecological interaction", "Symbiosis and succession."),
    ] 
  },
  { 
    name: "Chemistry", 
    periodical: [], 
    topical: [
      createMockPaper("g10-c-u1", "Unit 1: Chemical Reactions And Stoichiometry", "Mole concept and balanced equations."),
      createMockPaper("g10-c-u2", "Unit 2: Solutions", "Concentration and solubility."),
      createMockPaper("g10-c-u3", "Unit 3: Important Inorganic Compounds", "Oxides, acids, and bases."),
      createMockPaper("g10-c-u4", "Unit 4: Energy Changes And Electro-Chemistry", "Exothermic and endothermic reactions."),
      createMockPaper("g10-c-u5", "Unit 5: Metals And Non Metals", "Extraction and properties."),
      createMockPaper("g10-c-u6", "Unit 6: Hydrocarbons And Their Natural Sources", "Alkanes, alkenes, and alkynes."),
    ] 
  },
  { 
    name: "Economics", 
    periodical: [], 
    topical: [
      createMockPaper("g10-e-u1", "Unit 1: Theory of Consumer Behaviour", "Utility and indifference curves."),
      createMockPaper("g10-e-u2", "Unit 2: Theories of Demand and Supply", "Elasticity and market mechanisms."),
      createMockPaper("g10-e-u3", "Unit 3: Theories of Production and Cost", "Returns to scale."),
      createMockPaper("g10-e-u4", "Unit 4: Market Structure", "Perfect competition and monopoly."),
      createMockPaper("g10-e-u5", "Unit 5: Banking and Finance", "Money supply and central banking."),
      createMockPaper("g10-e-u6", "Unit 6: Economic Growth", "Theories of development."),
      createMockPaper("g10-e-u7", "Unit 7: The Ethiopian Economy", "Structure and performance."),
      createMockPaper("g10-e-u8", "Unit 8: Business Startups and Innovation", "Lean startup and design thinking."),
    ] 
  },
  { 
    name: "Geography", 
    periodical: [], 
    topical: [
      createMockPaper("g10-g-u1", "Unit 1: Land-forms Of Africa", "Mountains and rift valleys."),
      createMockPaper("g10-g-u2", "Unit 2: Climate Of Africa", "Climatic regions and variations."),
      createMockPaper("g10-g-u3", "Unit 3: Natural Resource Base Of Africa", "Minerals and energy."),
      createMockPaper("g10-g-u4", "Unit 4: Population of Africa", "Migration and demographic trends."),
      createMockPaper("g10-g-u5", "Unit 5: Major Economic and Cultural Activities of Africa", "Trade and globalization."),
      createMockPaper("g10-g-u6", "Unit 6: Human – Natural Environment Interactions In Africa", "Soil erosion and desertification."),
      createMockPaper("g10-g-u7", "Unit 7: Geographic Issues And Public Concerns In Africa", "Environment and health."),
      createMockPaper("g10-g-u8", "Unit 8: Geospatial Information And Data Processing", "GIS and digital maps."),
    ] 
  },
  { 
    name: "History", 
    periodical: [], 
    topical: [
      createMockPaper("g10-h-u1", "Unit 1: Development of Capitalism and Nationalism 1815-1914", "Imperialism and power struggles."),
      createMockPaper("g10-h-u2", "Unit 2: Africa & the Colonial Experience(1880s -1960s)", "Berlin conference and mandate system."),
      createMockPaper("g10-h-u3", "Unit 3: Social, Economic & Political Developments in Ethiopia mid-19th C. to 1941", "Menelik II and Haile Selassie."),
      createMockPaper("g10-h-u4", "Unit 4: Society and Politics in the Age of World Wars 1914-1945", "Totalitarianism and League of Nations."),
      createMockPaper("g10-h-u5", "Unit 5: Global and Regional Developments Since 1945", "Decolonization and regional bodies."),
      createMockPaper("g10-h-u6", "Unit 6: Ethiopia: Internal Developments and External Influences from 1941 to 1991", "Cold war impact on Ethiopia."),
      createMockPaper("g10-h-u7", "Unit 7: Africa Since 1960", "Unity attempts and post-colonial politics."),
      createMockPaper("g10-h-u8", "Unit 8: Post-1991 Developments in Ethiopia", "New constitution and regionalization."),
      createMockPaper("g10-h-u9", "Unit 9: Indigenous Knowledge and Heritages of Ethiopia", "Art, music, and social values."),
    ] 
  },
  { name: "English", periodical: [], topical: [createMockPaper("g10-en-u1", "Unit 1: Social Interaction", "Polite expressions and formal writing.")] },
];

const grade11Subjects: SubjectData[] = [
  { 
    name: "Math", 
    periodical: [], 
    topical: [
      createMockPaper("g11-m-u1", "Unit 1: Relations and functions", "Composite and inverse functions."),
      createMockPaper("g11-m-u2", "Unit 2: Rational Expression and Rational Functions", "Partial fractions and asymptotes."),
      createMockPaper("g11-m-u3", "Unit 3: Matrices", "Inverse matrices and Cramer's rule."),
      createMockPaper("g11-m-u4", "Unit 4: Determinants and their properties", "Expansion by cofactors."),
      createMockPaper("g11-m-u5", "Unit 5: Vectors", "Dot product and cross product in 3D."),
      createMockPaper("g11-m-u6", "Unit 6: Transformations of the plane", "Translation, rotation, and scaling."),
      createMockPaper("g11-m-u7", "Unit 7: Statistics", "Regression and correlation."),
      createMockPaper("g11-m-u8", "Unit 8: Probability", "Conditional probability and Bayes' Theorem."),
    ] 
  },
  { 
    name: "Physics", 
    periodical: [], 
    topical: [
      createMockPaper("g11-p-u1", "Unit 1: Physics and Human Society", "Modern physics and ethical considerations."),
      createMockPaper("g11-p-u2", "Unit 2: Vectors", "Vector calculus basics."),
      createMockPaper("g11-p-u3", "Unit 3: Motion in one and two dimensions", "Relative motion in 2D."),
      createMockPaper("g11-p-u4", "Unit 4: Dynamics", "Conservation of momentum and collisions."),
      createMockPaper("g11-p-u5", "Unit 5: Heat Conduction and Calorimetry", "Specific heat and latent heat."),
      createMockPaper("g11-p-u6", "Unit 6: Electrostatics and Electric Circuit", "Capacitancia and Kirchhoff's laws."),
      createMockPaper("g11-p-u7", "Unit 7: Nuclear Physic", "Radioactivity and nuclear reactions."),
    ] 
  },
  { 
    name: "Biology", 
    periodical: [], 
    topical: [
      createMockPaper("g11-b-u1", "Unit 1: Biology and Technology", "Enzyme technology and pharmaceuticals."),
      createMockPaper("g11-b-u2", "Unit 2: Characteristics of animals", "Invertebrates and vertebrates survey."),
      createMockPaper("g11-b-u3", "Unit 3: Enzymes", "Cofactors, inhibitors, and kinetic properties."),
      createMockPaper("g11-b-u4", "Unit 4: Genetics", "Mendelian genetics and molecular biology."),
      createMockPaper("g11-b-u5", "Unit 5: The human body systems", "Excretory and reproductive systems."),
      createMockPaper("g11-b-u6", "Unit 6: Population and natural resources", "Human population and resource management."),
    ] 
  },
  { 
    name: "Chemistry", 
    periodical: [], 
    topical: [
      createMockPaper("g11-c-u1", "Unit 1: Atomic Structure And Periodic Properties Of The Elements", "Quantum numbers and orbitals."),
      createMockPaper("g11-c-u2", "Unit 2: Chemical Bonding", "VSEPR theory and hybridization."),
      createMockPaper("g11-c-u3", "Unit 3: Physical State Of Matter", "Gas laws and intermolecular forces."),
      createMockPaper("g11-c-u4", "Unit 4: Chemical Kinetics", "Rate laws and activation energy."),
      createMockPaper("g11-c-u5", "Unit 5: Chemical Equilibrium", "Le Chatelier's principle."),
      createMockPaper("g11-c-u6", "Unit 6: Some Important Oxygen-containing Organic Compounds", "Alcohols, ethers, and aldehydes."),
    ] 
  },
  { 
    name: "Economics", 
    periodical: [], 
    topical: [
      createMockPaper("g11-e-u1", "Unit 1: Theory Of Consumer Behavior And Demand", "Utility maximization."),
      createMockPaper("g11-e-u2", "Unit 2: Market Structure And The Decision Of Firms", "Oligopoly and monopolistic competition."),
      createMockPaper("g11-e-u3", "Unit 3: National Income Accounting", "Expenditure and income methods."),
      createMockPaper("g11-e-u4", "Unit 4: Consumption, Saving And Investment", "Keynesian model."),
      createMockPaper("g11-e-u5", "Unit 5: Trade And Finance", "Balance of payments."),
      createMockPaper("g11-e-u6", "Unit 6: Economic Development", "Developing world indicators."),
      createMockPaper("g11-e-u7", "Unit 7: Main Sectors, Sectorial Policies And Strategies Of Ethiopia", "Agriculture-led industrialization."),
    ] 
  },
  { 
    name: "Geography", 
    periodical: [], 
    topical: [
      createMockPaper("g11-g-u1", "Unit 1: Formation of the Continents", "Continental drift and plate tectonics."),
      createMockPaper("g11-g-u2", "Unit 2: Climate Classification and Climate Regions of Our World", "Köppen classification."),
      createMockPaper("g11-g-u3", "Unit 3: Natural Resources and Conflicts Over Resources", "Sustainable management."),
      createMockPaper("g11-g-u4", "Unit 4: Global Population Dynamics and Challenges", "Overpopulation and aging."),
      createMockPaper("g11-g-u5", "Unit 5: Geography and Economic Development", "Spatial distribution of industry."),
      createMockPaper("g11-g-u6", "Unit 6: Major Global Environmental Changes", "Climate change and biodiversity loss."),
      createMockPaper("g11-g-u7", "Unit 7: Geographic Issues and Public Concerns", "Poverty and inequality."),
      createMockPaper("g11-g-u8", "Unit 8: Geo-spatial Information and Data Processing", "Remote sensing applications."),
    ] 
  },
  { 
    name: "History", 
    periodical: [], 
    topical: [
      createMockPaper("g11-h-u1", "Unit 1: History, Historiography, And Human Evolution", "Concepts of history."),
      createMockPaper("g11-h-u2", "Unit 2: Major Spots Of Ancient World Civilizations Up To C.500 A.D", "Greece, Rome, and Persia."),
      createMockPaper("g11-h-u3", "Unit 3: Peoples, States And Historical Processes In Ethiopia And The Horn To The End Of The 13th Century", "Medieval interactions."),
      createMockPaper("g11-h-u4", "Unit 4: The Middle Ages And Early Modern World, C. 500 AD-1789", "Discovery voyages and Absolute Monarchy."),
      createMockPaper("g11-h-u5", "Unit 5: Peoples And States Of Africa To 1500", "Bantu cultures."),
      createMockPaper("g11-h-u6", "Unit 6: Africa And The Outside World: 1500-1880", "Exploration and maps."),
      createMockPaper("g11-h-u7", "Unit 7: States, Principalities, Population Movements And Interactions In Ethiopia", "Political reorganization."),
      createMockPaper("g11-h-u8", "Unit 8: Political, Social, and Economic Processes In Ethiopia, Mid 16th To Mid-19th Century", "State formation."),
      createMockPaper("g11-h-u9", "Unit 9: The Age Of Revolutions, 1789 To 1815", "Napoleonic era."),
    ] 
  },
  { name: "English", periodical: [], topical: [createMockPaper("g11-en-u1", "Unit 1: Effective Reading", "Skimming, scanning, and critical analysis.")] },
];

const grade12Subjects: SubjectData[] = [
  { 
    name: "Math", 
    periodical: [], 
    topical: [
      createMockPaper("g12-m-u1", "Unit 1: Sequence and Series", "Arithmetic and Geometric sequences, partial sums, and limits of series."),
      createMockPaper("g12-m-u2", "Unit 2: Introduction to Calculus", "Limits, continuity, derivatives, and basic integration techniques."),
      createMockPaper("g12-m-u3", "Unit 3: Statistics", "Probability distributions, standard deviation, and data analysis."),
      createMockPaper("g12-m-u4", "Unit 4: Introduction to linear programming", "Inequalities, objective functions, and optimization problems."),
      createMockPaper("g12-m-u5", "Unit 5: Mathematical Application in Business", "Simple and compound interest, annuities, and business modeling."),
    ] 
  },
  { 
    name: "Physics", 
    periodical: [], 
    topical: [
      createMockPaper("g12-p-u1", "Unit 1: Application of physics in other fields", "Physics in medicine, engineering, and environmental science."),
      createMockPaper("g12-p-u2", "Unit 2: Two-dimensional motion", "Projectile motion, circular motion, and relative velocity."),
      createMockPaper("g12-p-u3", "Unit 3: Fluid Mechanics", "Pressure, buoyancy, Bernoulli's principle, and viscosity."),
      createMockPaper("g12-p-u4", "Unit 4: Electromagnetism", "Magnetic fields, Faraday's law, and Maxwell's equations."),
      createMockPaper("g12-p-u5", "Unit 5: Basics of electronics", "Semiconductors, diodes, transistors, and logic gates."),
    ] 
  },
  { 
    name: "Biology", 
    periodical: [], 
    topical: [
      createMockPaper("g12-b-u1", "Unit 1: Application of Biology", "Biotechnology, genetic engineering, and bioethics."),
      createMockPaper("g12-b-u2", "Unit 2: Microorganisms", "Bacteria, viruses, fungi, and their ecological roles."),
      createMockPaper("g12-b-u3", "Unit 3: Energy transformation", "Cellular respiration, photosynthesis, and metabolism."),
      createMockPaper("g12-b-u4", "Unit 4: Evolution", "Theories of evolution, natural selection, and human origins."),
      createMockPaper("g12-b-u5", "Unit 5: Human Body System", "Nervous system, endocrine system, and homeostasis."),
      createMockPaper("g12-b-u6", "Unit 6: Climate Change", "Greenhouse effect, biodiversity loss, and sustainability."),
    ] 
  },
  { 
    name: "Chemistry", 
    periodical: [], 
    topical: [
      createMockPaper("g12-c-u1", "Unit 1: Acid-Base Equilibrium", "pH calculations, buffers, and titration curves."),
      createMockPaper("g12-c-u2", "Unit 2: Electrochemistry", "Galvanic cells, electrolysis, and oxidation-reduction."),
      createMockPaper("g12-c-u3", "Unit 3: Industrial Chemistry", "Manufacturing processes for fertilizers, plastics, and metals."),
      createMockPaper("g12-c-u4", "Unit 4: Polymers", "Natural and synthetic polymers, polymerization reactions."),
      createMockPaper("g12-c-u5", "Unit 5: Introduction To Environmental Chemistry", "Atmospheric pollution, water treatment, and green chemistry."),
    ] 
  },
  { 
    name: "Economics", 
    periodical: [], 
    topical: [
      createMockPaper("g12-e-u1", "Unit 1: The Fundamental Concepts Of Macroeconomics", "GDP, inflation, and unemployment metrics."),
      createMockPaper("g12-e-u2", "Unit 2: Aggregate Demand And Aggregate Supply Analysis", "AD-AS model, macroeconomic equilibrium, and fiscal policy."),
      createMockPaper("g12-e-u3", "Unit 3: Market Failure And Consumer Protection", "Externalities, public goods, and consumer rights."),
      createMockPaper("g12-e-u4", "Unit 4: Macroeconomic Policy Instruments", "Monetary policy, central banking, and international trade."),
      createMockPaper("g12-e-u5", "Unit 5: Tax Theory And Practice", "Tax systems, incidence, and government revenue."),
      createMockPaper("g12-e-u6", "Unit 6: Poverty And Inequality", "Gini coefficient, poverty lines, and redistribution policies."),
      createMockPaper("g12-e-u7", "Unit 7: Macroeconomic Reforms In Ethiopia", "History of economic policy in Ethiopia and current reforms."),
      createMockPaper("g12-e-u8", "Unit 8: Economy, Environment And Climate Change", "Economic impact of climate change and green growth."),
    ] 
  },
  { 
    name: "Geography", 
    periodical: [], 
    topical: [
      createMockPaper("g12-g-u1", "Unit 1: Major Geological Processes Associated with Plate Tectonics", "Earth's internal structure, plate boundaries, and earthquakes."),
      createMockPaper("g12-g-u2", "Unit 2: Climate Change", "Global warming trends, impacts on Africa, and mitigation."),
      createMockPaper("g12-g-u3", "Unit 3: Management of Conflict Over Resources", "Water rights, land disputes, and resource diplomacy."),
      createMockPaper("g12-g-u4", "Unit 4: Population Policies, Programs and the Environment", "Demographic transition, family planning, and urban growth."),
      createMockPaper("g12-g-u5", "Unit 5: Challenges of Economic Development", "Developing nations, global trade, and infrastructure."),
      createMockPaper("g12-g-u6", "Unit 6: Solutions to Environmental and Sustainability Problems", "Renewable energy, conservation, and eco-friendly cities."),
      createMockPaper("g12-g-u7", "Unit 7: Contemporary Global Geographic Issues and Public Concerns", "Migration, health crises, and digital geography."),
      createMockPaper("g12-g-u8", "Unit 8: Geographical Enquiry and Map Making", "GIS, remote sensing, and advanced cartography."),
    ] 
  },
  { 
    name: "History", 
    periodical: [], 
    topical: [
      createMockPaper("g12-h-u1", "Unit 1: Development of Capitalism and Nationalism from 1815 to 1914", "Industrial Revolution, unification of Italy/Germany."),
      createMockPaper("g12-h-u2", "Unit 2: Africa and the Colonial Experience (1880s - 1960s)", "Scramble for Africa, resistance, and decolonization."),
      createMockPaper("g12-h-u3", "Unit 3: Social, Economic, and Political Developments in Ethiopia, Mid, 19th C. to 1941", "Reign of Theodore II to Italian occupation."),
      createMockPaper("g12-h-u4", "Unit 4: Society and Politics in the Age of World Wars, 1914 - 1945", "Origins of WWI, the interwar period, and WWII."),
      createMockPaper("g12-h-u5", "Unit 5: Global and Regional Developments Since 1945", "Cold War, UN establishment, and the Middle East conflict."),
      createMockPaper("g12-h-u6", "Unit 6: Ethiopia: Internal Developments and External Influences from 1941 to 1991", "Post-liberation Ethiopia, the Derg regime."),
      createMockPaper("g12-h-u7", "Unit 7: Africa since the 1960s", "Post-colonial challenges, OAU/AU, and economic growth."),
      createMockPaper("g12-h-u8", "Unit 8: Post-1991 Developments in Ethiopia", "EPRDF era, federalism, and modern political landscape."),
      createMockPaper("g12-h-u9", "Unit 9: Indigenous Knowledge Systems and Heritages of Ethiopia", "Traditional medicine, architecture, and cultural preservation."),
    ] 
  },
  { name: "English", periodical: [], topical: [createMockPaper("g12-en-u1", "Unit 1: Advanced Communication", "Public speaking, persuasive writing, and debate.")] },
];

export const MOCK_SCHOOLS: School[] = [
  {
    id: "sch-1",
    name: "Ethiopian International School-Riyadh",
    location: "Riyadh, Saudi Arabia",
    image: "https://picsum.photos/seed/eisr/800/600",
    grades: [
      { 
        grade: 9, 
        subjects: grade9Subjects 
      },
      { 
        grade: 10, 
        subjects: grade10Subjects 
      },
      { 
        grade: 11, 
        streams: [
          {
            name: "Natural Science",
            subjects: grade11Subjects.filter(s => ["Math", "English", "Physics", "Chemistry", "Biology"].includes(s.name))
          },
          {
            name: "Social Science",
            subjects: grade11Subjects.filter(s => ["Math", "English", "Geography", "History", "Economics"].includes(s.name))
          }
        ]
      },
      { 
        grade: 12, 
        streams: [
          {
            name: "Natural Science",
            subjects: grade12Subjects.filter(s => ["Math", "English", "Physics", "Chemistry", "Biology"].includes(s.name))
          },
          {
            name: "Social Science",
            subjects: grade12Subjects.filter(s => ["Math", "English", "Geography", "History", "Economics"].includes(s.name))
          }
        ]
      },
    ]
  }
];
